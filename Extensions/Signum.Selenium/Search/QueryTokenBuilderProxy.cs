using OpenQA.Selenium;

namespace Signum.Selenium;

public class QueryTokenBuilderProxy
{
    public IWebElement Element { get; private set; }

    public QueryTokenBuilderProxy(IWebElement element)
    {
        this.Element = element;
    }

    public string? FullKey => this.Element.GetDomAttribute("data-token");

    public WebElementLocator TokenElement(int tokenIndex)
    {
        return this.Element.WithLocator(By.CssSelector($".sf-query-token-part:nth-child({tokenIndex + 1})"));
    }

    public void SelectToken(string token)
    {
        string[] parts = token.Split('.');

        for (int i = 0; i < parts.Length; i++)
        {
            var prev = parts.Take(i).ToString(".");

            var qt = new QueryTokenPartProxy(TokenElement(i).WaitVisible());

            qt.Select(parts.Take(i + 1).ToString("."));
        }

        //Selenium.Wait(() =>
        //{
        //    var tokenLocator = TokenElement(parts.Length, token, isEnd: false);
        //    if (Selenium.IsElementPresent(tokenLocator))
        //    {
        //        new
        //        Selenium.FindElement(tokenLocator).SelectElement().SelectByValue("");
        //        return true;
        //    }

        //    if (Selenium.IsElementPresent(TokenElement(parts.Length, token, isEnd: true)))
        //        return true;

        //    return false;
        //});
    }
}
