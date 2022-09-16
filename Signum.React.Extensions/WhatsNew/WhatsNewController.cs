using System.IO;
using Signum.Entities.Authorization;
using Signum.Engine.Files;
using Signum.Engine.Mailing;
using Signum.Engine.Authorization;
using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Signum.Entities.WhatsNew;
using Signum.Engine.WhatsNew;
using Signum.React.Filters;
using Signum.Entities.Files;
using System.ComponentModel.DataAnnotations;
using Signum.React.Facades;

namespace Signum.React.WhatsNew;

public class WhatsNewController : ControllerBase
{
    [HttpGet("api/whatsnew/myNewsCount")]
    public MyNewsCountResult MyNewsCount()
    {
        return new MyNewsCountResult
        {
            NumWhatsNews = Database.Query<WhatsNewEntity>().Count(w => !w.IsRead())
        };
    }

    public class MyNewsCountResult
    {
        public int NumWhatsNews;
    }

    [HttpGet("api/whatsnew/myNews")]
    public List<WhatsNewShort> MyNews()
    {
        return Database.Query<WhatsNewEntity>()
            .Where(w => !w.IsRead())
            .ToList()
            .Select(wn =>
            {
                var cm = wn.GetCurrentMessage();
                return new WhatsNewShort
                {
                    WhatsNew = wn.ToLite(),
                    CreationDate = wn.CreationDate,
                    Title = cm.Title,
                    Description = cm.Description,
                };
            })
            .ToList();
    }

    public class WhatsNewShort
    {
        public Lite<WhatsNewEntity> WhatsNew;
        public DateTime CreationDate; 
        public string Title;
        public string Description;
    }


    [HttpGet("api/whatsnew/all")]
    public List<WhatsNewFull> GetAllNews()
    {
        return Database.Query<WhatsNewEntity>()
        .ToList()
        .Select(wn =>
        {
            var cm = wn.GetCurrentMessage();
            return new WhatsNewFull
            {
                WhatsNew = wn.ToLite(),
                CreationDate = wn.CreationDate,
                Title = cm.Title,
                Description = cm.Description,
                Attachments = wn.Attachment.Count(),
                PreviewPicture = (wn.PreviewPicture != null) ? true : false,
                Read = wn.IsRead(),
            };
        })
        .ToList();
    }


    public class WhatsNewFull
    {
        public Lite<WhatsNewEntity> WhatsNew;
        public DateTime CreationDate;
        public string Title;
        public string Description;
        public int Attachments; 
        public bool PreviewPicture; 
        public bool Read;
    }

    [HttpGet("api/whatsnew/previewPicture/{newsid}"), SignumAllowAnonymous]
    public FileStreamResult? GetPreviewPicture(int newsid)
    {
        using (AuthLogic.Disable())
        {
            var whatsnew = Database.Retrieve<WhatsNewEntity>(newsid);
            return (whatsnew.PreviewPicture == null) ? null : GetFileStreamResult(whatsnew.PreviewPicture.OpenRead(), whatsnew.PreviewPicture.FileName);
        }
    }

    public static FileStreamResult GetFileStreamResult(Stream stream, string fileName)
    {
        var mime = MimeMapping.GetMimeType(fileName);
        return new FileStreamResult(stream, mime);
    }

    [HttpPost("api/whatsnew/specificNews")]
    public WhatsNewFull SpecificNews([FromBody, Required] int id)
    {
        var wne = Database.Retrieve<WhatsNewEntity>(id);
        var cm = wne.GetCurrentMessage();
        return new WhatsNewFull
        {
            WhatsNew = wne.ToLite(),
            Title = cm.Title,
            Description = cm.Description,
            Attachments = wne.Attachment.Count(),
            PreviewPicture = (wne.PreviewPicture != null) ? true : false,
            Read = wne.IsRead(),
        };
    }

    [HttpPost("api/whatsnew/entityforattachments")]
    public WhatsNewEntity Attachments([FromBody, Required] int id)
    {
        return Database.Retrieve<WhatsNewEntity>(id);
    }

    [HttpPost("api/whatsnew/setNewsLog")]
    public bool setNewsLogRead([FromBody, Required] int[] ids)
    {
        using (OperationLogic.AllowSave<WhatsNewLogEntity>())
        {
            foreach (int id in ids)
            {
                new WhatsNewLogEntity()
                {
                    WhatsNew = Database.Retrieve<WhatsNewEntity>(id).ToLite(),
                    User = UserEntity.Current,
                    ReadOn = Clock.Now
                }.Save();
            }
            return true;
        }
    }
}