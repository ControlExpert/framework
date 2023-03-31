namespace Signum.Authorization.Rules;

public enum AuthAdminMessage
{
    [Description("{0} of {1}")]
    _0of1,
    TypeRules,
    PermissionRules,

    Allow,
    Deny,

    Overriden,
    Filter,
    PleaseSaveChangesFirst,
    ResetChanges,
    SwitchTo,

    OnlyActive,

    [Description("{0} (in UI)")]
    _0InUI,
    [Description("{0} (in DB only)")]
    _0InDB,

    [Description("Can not be modified")]
    CanNotBeModified,

    [Description("Can not be modified because is in condition {0}")]
    CanNotBeModifiedBecauseIsInCondition0,

    [Description("Can not be modified because is not in condition {0}")]
    CanNotBeModifiedBecauseIsNotInCondition0,

    [Description("Can not be read because is in condition {0}")]
    CanNotBeReadBecauseIsInCondition0,

    [Description("Can not be read because is not in condition {0}")]
    CanNotBeReadBecauseIsNotInCondition0,

    [Description("{0} rules for {1}")]
    _0RulesFor1,

    TheUserStateMustBeDisabled,

    [Description(@"{0} cycles have been found in the graph of Roles due to the relationships:")]
    _0CyclesHaveBeenFoundInTheGraphOfRolesDueToTheRelationships,

    ConflictMergingTypeConditions,

    Save,

    [Description("Default Authorization: ")]
    DefaultAuthorization,

    [Description("Maximum of the {0}")]
    MaximumOfThe0,
    [Description("Minimum of the {0}")]
    MinumumOfThe0,
    [Description("Same as {0}")]
    SameAs0,
    Nothing,
    Everything,

    [Description("Select Type Condition(s)")]
    SelectTypeConditions,

    [Description("There are {0} Type Conditions defined for {1}.")]
    ThereAre0TypeConditionsDefinedFor1,

    [Description("Select one to override the access for {0} that satisfy this condition.")]
    SelectOneToOverrideTheAccessFor0ThatSatisfyThisCondition,

    [Description("Select more than one to override access for {0} that satisfy all the conditions at the same time.")]
    SelectMoreThanOneToOverrideAccessFor0ThatSatisfyAllTheConditionsAtTheSameTime,

    [Description("Repeated Type Conditions")]
    RepeatedTypeCondition,

    [Description("The following Type Conditions have already been used:")]
    TheFollowingTypeConditionsHaveAlreadyBeenUsed,

    [Description("Role {0} inherits from trivial merge role {1}")]
    Role0InheritsFromTrivialMergeRole1,

    IncludeTrivialMerges,

    [Description("Role {0} is trivial merge")]
    Role0IsTrivialMerge,

    Check,
    Uncheck,

    AddCondition,
    RemoveCondition,
}
