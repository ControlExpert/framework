using Signum.Mailing;
using Microsoft.Graph;
using System.IO;
using Microsoft.Graph.Users.Item.Messages.Item.Attachments.CreateUploadSession;
using Microsoft.Graph.Models;
using Azure.Identity;
using Azure.Core;
using Microsoft.Graph.Models.ODataErrors;
using Microsoft.Kiota.Abstractions.Extensions;
using Signum.Authorization;
using Signum.Files;
using Signum.Authorization.ActiveDirectory.Azure;

namespace Signum.Mailing.MicrosoftGraph;

//https://jatindersingh81.medium.com/c-code-to-to-send-emails-using-microsoft-graph-api-2a90da6d648a
//https://www.jeancloud.dev/2020/06/05/using-microsoft-graph-as-smtp-server.html
public class MicrosoftGraphSender : EmailSenderBase
{
    public static long MicrosoftGraphFileSizeLimit = 3 * 1024 * 1024;
    MicrosoftGraphEmailServiceEntity microsoftGraph;

    public MicrosoftGraphSender(EmailSenderConfigurationEntity senderConfig, MicrosoftGraphEmailServiceEntity service) : base(senderConfig)
    {
        microsoftGraph = service;
    }

    protected override void SendInternal(EmailMessageEntity email)
    {
        try
        {
            try
            {
                var tokenCritical = microsoftGraph.GeTokenCredential();
                GraphServiceClient graphClient = new GraphServiceClient(tokenCritical);

                var bigAttachments = email.Attachments.Where(a => a.File.FileLength > MicrosoftGraphFileSizeLimit).ToList();

                var message = ToGraphMessageWithSmallAttachments(email);
                var userId = email.From.AzureUserId.ToString();
                var user = graphClient.Users[userId];

                if (bigAttachments.IsEmpty())
                {
                    user.SendMail.PostAsync(new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody
                    {
                        Message = message,
                        SaveToSentItems = false,
                    }).Wait();
                }
                else if (bigAttachments.Any())
                {
                    message.IsDraft = true;

                    var newMessage = user.Messages.PostAsync(message).Result!;
                    foreach (var a in bigAttachments)
                    {
                        UploadSession uploadSession = user.Messages[newMessage.Id].Attachments.CreateUploadSession.PostAsync(new CreateUploadSessionPostRequestBody
                        {
                            AttachmentItem = new AttachmentItem
                            {
                                AttachmentType = AttachmentType.File,
                                IsInline = a.Type == EmailAttachmentType.LinkedResource,
                                Name = a.File.FileName,
                                Size = a.File.FileLength,
                                ContentType = MimeMapping.GetMimeType(a.File.FileName)
                            },
                        }).Result!;

                        int maxSliceSize = 320 * 1024;
                        
                        using var fileStream = new MemoryStream(a.File.GetByteArray());

                        var fileUploadTask = new LargeFileUploadTask<FileAttachment>(uploadSession, fileStream, maxSliceSize).UploadAsync().Result;

                        if (!fileUploadTask.UploadSucceeded)
                            throw new InvalidOperationException("Upload of big files to Microsoft Graph didn't succeed");
                    }

                    user.MailFolders["Drafts"].Messages[newMessage.Id].Send.PostAsync().Wait();
                }
            }
            catch (AggregateException e)
            {
                var only = e.InnerExceptions.Only();
                if (only != null)
                {
                    only.PreserveStackTrace();
                    throw only;
                }
                else
                {
                    throw;
                }
            }
        }
        catch (ODataError e)
        {
            throw new ODataException(e);
        }
    }

    private Message ToGraphMessageWithSmallAttachments(EmailMessageEntity email)
    {
        return new Message
        {
            Subject = email.Subject,
            Body = new ItemBody
            {
                Content = email.Body.Text,
                ContentType = email.IsBodyHtml ? BodyType.Html : BodyType.Text,
            },
            From = email.From.ToRecipient(),
            ToRecipients = email.Recipients.Where(r => r.Kind == EmailRecipientKind.To).Select(r => r.ToRecipient()).ToList(),
            CcRecipients = email.Recipients.Where(r => r.Kind == EmailRecipientKind.Cc).Select(r => r.ToRecipient()).ToList(),
            BccRecipients = email.Recipients.Where(r => r.Kind == EmailRecipientKind.Bcc).Select(r => r.ToRecipient()).ToList(),
            Attachments = GetAttachments(email.Attachments)
        };
    }

    private List<Attachment> GetAttachments(MList<EmailAttachmentEmbedded> attachments)
    {
        var result = new List<Attachment>();
        
        foreach (var a in attachments)
        {
            if (a.File.FileLength <= MicrosoftGraphFileSizeLimit)
                result.Add(new FileAttachment
                {
                    ContentId = a.ContentId,
                    Name = a.File.FileName,
                    IsInline = a.Type == EmailAttachmentType.LinkedResource,
                    ContentType = MimeMapping.GetMimeType(a.File.FileName),
                    ContentBytes = a.File.GetByteArray(),
                });
        }
        return result;
    }
}

public static class MicrosoftGraphExtensions
{
    public static Recipient ToRecipient(this EmailAddressEmbedded address)
    {
        return new Recipient
        {
            EmailAddress = new EmailAddress
            {
                Address = address.EmailAddress,
                Name = address.DisplayName
            }
        };
    }

    public static Recipient ToRecipient(this EmailRecipientEmbedded recipient)
    {
        if (!EmailLogic.Configuration.SendEmails)
            throw new InvalidOperationException("EmailConfigurationEmbedded.SendEmails is set to false");

        return new Recipient
        {
            EmailAddress = new EmailAddress
            {
                Address = EmailLogic.Configuration.OverrideEmailAddress.DefaultText(recipient.EmailAddress),
                Name = recipient.DisplayName
            }
        };
    }



    public static TokenCredential GeTokenCredential(this MicrosoftGraphEmailServiceEntity microsoftGraph, string[]? scopes = null)
    {
        if (SignumTokenCredentials.OverridenTokenCredential.Value is var ap && ap != null)
            return ap;

        if (microsoftGraph.UseActiveDirectoryConfiguration)
            return SignumTokenCredentials.GetAuthorizerTokenCredential();

        ClientSecretCredential result = new ClientSecretCredential(
            tenantId: microsoftGraph.Azure_DirectoryID.ToString(),
            clientId: microsoftGraph.Azure_ApplicationID.ToString(),
            clientSecret: microsoftGraph.Azure_ClientSecret);

        return result;
    }



  
}

