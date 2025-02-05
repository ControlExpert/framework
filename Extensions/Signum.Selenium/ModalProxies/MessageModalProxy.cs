using OpenQA.Selenium;

namespace Signum.Selenium;

public class MessageModalProxy : ModalProxy
{
    public MessageModalProxy(IWebElement element) : base(element)
    {
        if (!this.Element.HasClass("modal"))
            throw new InvalidOperationException("Not a valid modal");
    }

    public IWebElement GetButton(MessageModalButton button)
    {
        var className =
            button == MessageModalButton.Yes ? "sf-yes-button" :
            button == MessageModalButton.No ? "sf-no-button" :
            button == MessageModalButton.Ok ? "sf-ok-button" :
            button == MessageModalButton.Cancel ? "sf-cancel-button" :
        throw new NotImplementedException("Unexpected button");

        return this.Element.FindElement(By.ClassName(className));
    }

    public void Click(MessageModalButton button)
    {
        this.GetButton(button).ButtonClick();
    }

    public void ClickWaitClose(MessageModalButton button)
    {
        this.GetButton(button).ButtonClick();
        this.WaitNotVisible();
    }

    public static string GetMessageText(WebDriver selenium, MessageModalProxy modal)
    {
        return modal.Element.FindElement(By.ClassName("text-warning")).Text;
    }

    public static string GetMessageTitle(WebDriver selenium, MessageModalProxy modal)
    {
        return modal.Element.FindElement(By.ClassName("modal-title")).Text;
    }
}

public static class MessageModalProxyExtensions
{
    public static bool IsMessageModalPresent(this WebDriver selenium)
    {
        var message = GetMessageModal(selenium);

        if (message == null)
            return false;

        return true;
    }

    public static MessageModalProxy? GetMessageModal(this WebDriver selenium)
    {
        var element = selenium.TryFindElement(By.ClassName("message-modal"));

        if (element == null)
             return null;

        return new MessageModalProxy(element.GetParent());
    }

    public static void CloseMessageModal(this WebDriver selenium, MessageModalButton button)
    {
        var message = selenium.Wait(() => GetMessageModal(selenium))!;

        message.Click(button);
    }

    public static MessageModalProxy AsMessageModal(this IWebElement element)
    {
        return new MessageModalProxy(element);
    }
}

public enum MessageModalButton
{
    Yes,
    No,
    Ok,
    Cancel
}
