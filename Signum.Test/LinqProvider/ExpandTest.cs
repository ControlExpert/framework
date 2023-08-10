﻿
namespace Signum.Test.LinqProvider;

/// <summary>
/// Summary description for LinqProvider
/// </summary>
public class ExpandTest
{
    public ExpandTest()
    {
        MusicStarter.StartAndLoad();
        Connector.CurrentLogger = new DebugTextWriter();
    }

    [Fact]
    public void ExpandToStringNull()
    {
        Database.Query<CountryEntity>().Select(a => a.ToLite()).ExpandLite(a => a, ExpandLite.ToStringNull).ToList();
    }

    [Fact]
    public void ExpandToStringLazy()
    {
        Database.Query<CountryEntity>().Select(a => a.ToLite()).ExpandLite(a => a, ExpandLite.ToStringLazy).ToList();
    }

    [Fact]
    public void ExpandToStringEager()
    {
        Database.Query<CountryEntity>().Select(a => a.ToLite()).ExpandLite(a => a, ExpandLite.ToStringEager).ToList();
    }

    [Fact]
    public void ExpandEntityEager()
    {
        var list = Database.Query<CountryEntity>().Select(a => a.ToLite()).ExpandLite(a => a, ExpandLite.EntityEager).ToList();
    }


    [Fact]
    public void ExpandLazyEntity()
    {
        var list = Database.Query<CountryEntity>().ExpandEntity(a => a, ExpandEntity.LazyEntity).ToList();
    }

}
