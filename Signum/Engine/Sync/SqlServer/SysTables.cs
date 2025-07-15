namespace Signum.Engine.Sync.SqlServer;

#pragma warning disable 649
#pragma warning disable CS8618 // Non-nullable field is uninitialized.

[TableName("sys.objects")]
public class SysObjects : IView
{
    [ViewPrimaryKey]
    public int object_id;
    public int schema_id;
    public string type;
    public string type_desc;
    public string name;
}

[TableName("sys.servers")]
public class SysServers : IView
{
    [ViewPrimaryKey]
    public int server_id;
    public string name;
}

[TableName("sys.databases")]
public class SysDatabases : IView
{
    [ViewPrimaryKey]
    public int database_id;
    public string name;
    public byte[] owner_sid;
    public string collation_name;
    public bool is_broker_enabled;

    public bool snapshot_isolation_state;
    public bool is_read_committed_snapshot_on;
}


[TableName("sys.server_principals")]
public class SysServerPrincipals : IView
{
    [ViewPrimaryKey]
    public int principal_id;
    public string name;
    public byte[] sid;
    public string type_desc;
}

[TableName("sys.database_principals")]
public class SysDatabasePrincipals : IView
{
    [ViewPrimaryKey]
    public int principal_id;
    public string name;
    public byte[] sid;
    public string type_desc;
}

[TableName("sys.schemas")]
public class SysSchemas : IView
{
    [ViewPrimaryKey]
    public int schema_id;
    public string name;

    [AutoExpressionField]
    public IQueryable<SysTables> Tables() =>
        As.Expression(() => Database.View<SysTables>().Where(t => t.schema_id == schema_id));
}

[TableName("sys.periods")]
public class SysPeriods : IView
{
    [ViewPrimaryKey]
    public int object_id;

    public int start_column_id;
    public int end_column_id;
}


[TableName("sys.tables")]
public class SysTables : IView
{
    public string name;
    [ViewPrimaryKey]
    public int object_id;
    public int schema_id;

    [ColumnName("temporal_type")]
    public SysTableTemporalType temporal_type;
    public int? history_table_id;


    [AutoExpressionField]
    public IQueryable<SysColumns> Columns() =>
        As.Expression(() => Database.View<SysColumns>().Where(c => c.object_id == object_id));

    public IQueryable<SysColumns> ColumnsOriginal() =>
        As.Expression(() => Database.View<SysColumns>().Where(c => c.object_id == object_id));

    static Expression<Func<SysTables, IQueryable<SysColumns>>> ColumnsGood;
    static void ColumnsGoodInit()
    {
        ColumnsGood = @this => Database.View<SysColumns>().Where(c => c.object_id == @this.object_id);
    }

    [AutoExpressionField]
    public IQueryable<SysForeignKeys> ForeignKeys() =>
        As.Expression(() => Database.View<SysForeignKeys>().Where(fk => fk.parent_object_id == object_id));

    [AutoExpressionField]
    public IQueryable<SysForeignKeys> IncomingForeignKeys() =>
        As.Expression(() => Database.View<SysForeignKeys>().Where(fk => fk.referenced_object_id == object_id));

    [AutoExpressionField]
    public IQueryable<SysKeyConstraints> KeyConstraints() =>
        As.Expression(() => Database.View<SysKeyConstraints>().Where(fk => fk.parent_object_id == object_id));

    [AutoExpressionField]
    public IQueryable<SysCheckConstraints> CheckConstraints() =>
    As.Expression(() => Database.View<SysCheckConstraints>().Where(fk => fk.parent_object_id == object_id));


    [AutoExpressionField]
    public IQueryable<SysIndexes> Indices() =>
        As.Expression(() => Database.View<SysIndexes>().Where(ix => ix.object_id == object_id));

    [AutoExpressionField]
    public IQueryable<SysStats> Stats() =>
        As.Expression(() => Database.View<SysStats>().Where(ix => ix.object_id == object_id));

    [AutoExpressionField]
    public IQueryable<SysExtendedProperties> ExtendedProperties() =>
        As.Expression(() => Database.View<SysExtendedProperties>().Where(ep => ep.major_id == object_id));

    [AutoExpressionField]
    public IQueryable<SysForeignKeyColumns> ForeignKeyColumns() =>
        As.Expression(() => Database.View<SysForeignKeyColumns>().Where(fkc => fkc.parent_object_id == object_id));

    [AutoExpressionField]
    public IQueryable<SysPeriods> Periods() =>
        As.Expression(() => Database.View<SysPeriods>().Where(p => p.object_id == object_id));

    [AutoExpressionField]
    public SysSchemas Schema() => 
        As.Expression(() => Database.View<SysSchemas>().Single(a => a.schema_id == this.schema_id));

    [AutoExpressionField]
    public SysFullTextIndexes? FullTextSearchIndex() =>
      As.Expression(() => Database.View<SysFullTextIndexes>().SingleOrDefaultEx(a => a.object_id == this.object_id));
}

[TableName("sys.views")]
public class SysViews : IView
{
    public string name;
    [ViewPrimaryKey]
    public int object_id;

    public int schema_id;

    [AutoExpressionField]
    public IQueryable<SysIndexes> Indices() =>
        As.Expression(() => Database.View<SysIndexes>().Where(ix => ix.object_id == object_id));

    [AutoExpressionField]
    public IQueryable<SysColumns> Columns() =>
        As.Expression(() => Database.View<SysColumns>().Where(c => c.object_id == object_id));
}

[TableName("sys.columns")]
public class SysColumns : IView
{
    public string name;
    [ViewPrimaryKey]
    public int object_id;
    public int column_id;
    public int default_object_id;
    public string collation_name;
    public bool is_nullable;
    public int user_type_id;
    public int system_type_id;
    public int max_length;
    public int precision;
    public int scale;
    public bool is_identity;

    [ColumnName("generated_always_type")]
    public GeneratedAlwaysType generated_always_type;

    [AutoExpressionField]
    public SysTypes? Type() =>
        As.Expression(() => Database.View<SysTypes>().SingleOrDefaultEx(a => a.system_type_id == system_type_id && a.user_type_id == user_type_id));
}

[TableName("sys.default_constraints")]
public class SysDefaultConstraints : IView
{
    public string name;
    public int object_id;
    public int parent_object_id;
    public int parent_column_id;
    public string definition;
    public bool is_system_named;
}

[TableName("sys.check_constraints")]
public class SysCheckConstraints : IView
{
    public string name;
    public int object_id;
    public int parent_object_id;
    public int parent_column_id;
    public string definition;
}


[TableName("sys.types")]
public class SysTypes : IView
{
    [ViewPrimaryKey]
    public int system_type_id;
    public int user_type_id;
    public string name;
}

[TableName("sys.key_constraints")]
public class SysKeyConstraints : IView
{
    public string name;
    [ViewPrimaryKey]
    public int object_id;
    public int schema_id;
    public int parent_object_id;
    public string type;

    [AutoExpressionField]
    public SysSchemas Schema() =>
        As.Expression(() => Database.View<SysSchemas>().Single(a => a.schema_id == schema_id));
}

[TableName("sys.foreign_keys")]
public class SysForeignKeys : IView
{
    [ViewPrimaryKey]
    public int object_id;
    public int schema_id;
    public string name;
    public int parent_object_id;
    public int referenced_object_id;
    public bool is_disabled;
    public bool is_not_trusted;

    [AutoExpressionField]
    public IQueryable<SysForeignKeyColumns> ForeignKeyColumns() =>
        As.Expression(() => Database.View<SysForeignKeyColumns>().Where(fkc => fkc.constraint_object_id == object_id));

    [AutoExpressionField]
    public SysSchemas Schema() =>
        As.Expression(() => Database.View<SysSchemas>().Single(a => a.schema_id == schema_id));

    [AutoExpressionField]
    public SysTables ParentTable() =>
        As.Expression(() => Database.View<SysTables>().Single(a => a.object_id == parent_object_id));

    [AutoExpressionField]
    public SysTables ReferencedTable() =>
        As.Expression(() => Database.View<SysTables>().Single(a => a.object_id == referenced_object_id));
}

[TableName("sys.foreign_key_columns")]
public class SysForeignKeyColumns : IView
{
    public int constraint_object_id;
    public int constraint_column_id;
    public int parent_object_id;
    public int parent_column_id;
    public int referenced_object_id;
    public int referenced_column_id;
}

[TableName("sys.indexes")]
public class SysIndexes : IView
{
    [ViewPrimaryKey]
    public int index_id;
    public string name;
    public int object_id;
    public bool is_unique;
    public int data_space_id;
    public bool is_primary_key;
    public int type;
    public string filter_definition;

    [AutoExpressionField]
    public IQueryable<SysIndexColumn> IndexColumns() =>
        As.Expression(() => Database.View<SysIndexColumn>().Where(ixc => ixc.index_id == index_id && ixc.object_id == object_id));

    [AutoExpressionField]
    public SysTables Table() =>
        As.Expression(() => Database.View<SysTables>().Single(a => a.object_id == object_id));

    [AutoExpressionField]
    public IQueryable<SysPartitions> Partitions() =>
        As.Expression(() => Database.View<SysPartitions>().Where(au => au.object_id == object_id && au.index_id == index_id));

    [AutoExpressionField]
    public string? DataSpaceName() =>
        As.Expression(() => Database.View<SysDataSpaces>().SingleOrDefault(au => au.data_space_id == data_space_id)!.name);
}

[TableName("sys.index_columns")]
public class SysIndexColumn : IView
{
    public int object_id;
    public int index_id;
    public int column_id;
    public int index_column_id;
    public int key_ordinal;
    public int partition_ordinal;
    public bool is_included_column;
    public bool is_descending_key;
}


[TableName("sys.fulltext_indexes")]
public class SysFullTextIndexes : IView
{
    [ViewPrimaryKey]
    public int object_id;
    public int unique_index_id;
    public int fulltext_catalog_id;
    public bool is_enabled;
    public char change_tracking_state;
    public int stoplist_id; 
    public int property_list_id;

    [AutoExpressionField]
    public IQueryable<SysFullTextIndexesColumns> IndexColumns() =>
        As.Expression(() => Database.View<SysFullTextIndexesColumns>().Where(ixc => ixc.object_id == this.object_id));

    [AutoExpressionField]
    public SysFullTextCatallog Catallog() =>
        As.Expression(() => Database.View<SysFullTextCatallog>().SingleOrDefaultEx(ixc => ixc.fulltext_catalog_id == this.fulltext_catalog_id)!);

    [AutoExpressionField]
    public SysRegisterSearchProperties Properties() =>
        As.Expression(() => Database.View<SysRegisterSearchProperties>().SingleOrDefaultEx(ixc => ixc.property_list_id == this.property_list_id)!);

    [AutoExpressionField]
    public SysFullTextStoplist Stoplist() =>
        As.Expression(() => Database.View<SysFullTextStoplist>().SingleOrDefaultEx(ixc => ixc.stoplist_id == this.stoplist_id)!);

}

[TableName("sys.fulltext_index_columns")]
public class SysFullTextIndexesColumns : IView
{
    public int object_id;
    public int column_id;
    public int type_column_id;
    public int language_id;
    public int statistical_semantics;
}

[TableName("sys.fulltext_catalogs")]
public class SysFullTextCatallog : IView
{
    public int fulltext_catalog_id;
    public string name;
}

[TableName("sys.fulltext_stoplists")]
public class SysFullTextStoplist : IView
{
    public int stoplist_id;
    public string name;
}

[TableName("sys.registered_search_properties")]
public class SysRegisterSearchProperties : IView
{
    public int property_list_id;
    public string property_name;
}

[TableName("sys.stats")]
public class SysStats : IView
{
    [ViewPrimaryKey]
    public int object_id;
    public int stats_id;
    public string name;
    public bool auto_created;
    public bool user_created;
    public bool no_recompute;

    [AutoExpressionField]
    public IQueryable<SysStatsColumn> StatsColumns() =>
        As.Expression(() => Database.View<SysStatsColumn>().Where(ixc => ixc.stats_id == stats_id && ixc.object_id == object_id));
}

[TableName("sys.stats_columns")]
public class SysStatsColumn : IView
{
    public int object_id;
    public int stats_id;
    public int stats_column_id;
    public int column_id;
}

[TableName("sys.extended_properties")]
public class SysExtendedProperties : IView
{
    public int major_id;
    public string name;
}

[TableName("sys.sql_modules")]
public class SysSqlModules : IView
{
    [ViewPrimaryKey]
    public int object_id;
    public string definition;
}

[TableName("sys.procedures")]
public class SysProcedures : IView
{
    [ViewPrimaryKey]
    public int object_id;
    public int schema_id;
    public string name;


    [AutoExpressionField]
    public SysSchemas Schema() =>
        As.Expression(() => Database.View<SysSchemas>().Single(a => a.schema_id == schema_id));
}

[TableName("sys.service_queues")]
public class SysServiceQueues : IView
{
    [ViewPrimaryKey]
    public int object_id;
    public int schema_id;
    public string name;
    public string activation_procedure;

    [AutoExpressionField]
    public SysSchemas Schema() =>
        As.Expression(() => Database.View<SysSchemas>().Single(a => a.schema_id == schema_id));
}

[TableName("sys.partitions")]
public class SysPartitions : IView
{
    [ViewPrimaryKey]
    public int partition_id;
    public int object_id;
    public int index_id;
    public int rows;

    [AutoExpressionField]
    public IQueryable<SysAllocationUnits> AllocationUnits() =>
        As.Expression(() => Database.View<SysAllocationUnits>().Where(au => au.container_id == partition_id));
}

[TableName("sys.allocation_units")]
public class SysAllocationUnits : IView
{
    [ViewPrimaryKey]
    public int container_id;
    public int total_pages;
}

[TableName("sys.partition_functions")]
public class SysPartitionFunction : IView
{
    [ViewPrimaryKey]
    public int function_id;
    public string name;
    public string type;
    public string type_desc;
    public int fanout;
    public bool boundary_value_on_right;
    public bool is_system;
    public DateTime create_date;
    public DateTime modify_date;
}

[TableName("sys.partition_range_values")]
public class SysPartitionRangeValues : IView
{
    [ViewPrimaryKey]
    public int function_id;
    public int boundary_id;
    public int parameter_id;
    public string value;
  
}

[TableName("sys.partition_schemes")]
public class SysPartitionSchemes : IView
{
    [ViewPrimaryKey]
    public int data_space_id;
    public string name;
    public string type;
    public string type_desc;
    public bool is_default;
    public bool is_system;
    public int function_id;

}

[TableName("sys.destination_data_spaces")]
public class SysDestinationDataSpaces : IView
{
    public int partition_scheme_id;
    public int destination_id;
    public int data_space_id;
}

[TableName("sys.data_spaces")]
public class SysDataSpaces : IView
{
    public string name;
    public int data_space_id;
    public string type;
    public string type_desc;
    public int is_default;
}

[TableName("sys.filegroups")]
public class SysFileGroups : IView
{
    [ViewPrimaryKey]
    public int data_space_id;
    public string name;
    public string type;
    public string type_desc;
    public bool is_default;
    public bool is_system;
    public Guid? filegroup_guid;
    public bool is_read_only;
    public bool is_autogrow_all_files;
}

#pragma warning restore 649
