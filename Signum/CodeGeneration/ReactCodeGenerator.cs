using System.IO;
using System.Text.RegularExpressions;
using Signum.Engine.Maps;

namespace Signum.CodeGeneration;

public class ReactCodeGenerator
{
    public string SolutionName = null!;
    public string SolutionFolder = null!;

    public Schema CurrentSchema = null!;

    public virtual void GenerateReactFromEntities()
    {
        CurrentSchema = Schema.Current;

        GetSolutionInfo(out SolutionFolder, out SolutionName);

        string projectFolder = GetProjectFolder();

        if (!Directory.Exists(projectFolder))
            throw new InvalidOperationException("{0} not found. Override GetProjectFolder".FormatWith(projectFolder));

        bool? overwriteFiles = null;

        foreach (var mod in GetModules())
        {
            if (Directory.Exists(BaseFileName(mod)))
            {
                var clientFile = GetClientFile(mod);

                if (File.Exists(clientFile))
                {
                    var lines = File.ReadAllLines(clientFile).ToList();

                    {
                        var index = lines.FindLastIndex(s => s.Contains("Navigator.addSettings(new EntitySettings")).NotFoundToNull() ??
                           lines.FindLastIndex(s => s.Contains("export function start")).NotFoundToNull() ?? 0;
                        lines.Insert(index + 1, WritetEntitySettings(mod).Trim().Indent(2));
                    }

                    {
                        var regex = new Regex(@"\s*}\s*from (""(?<path>[^""]+)""|'(?<path>[^']+)')");

                        var importIndex = lines.FindIndex(a => regex.Match(a) is { } m && m.Success && m.Groups["path"].Value?.TryAfterLast("/") == mod.Types.First().Namespace);

                        if (importIndex >= 0)
                            lines[importIndex] = regex.Replace(lines[importIndex], m => ", " + mod.Types.Select(a => a.Name).ToString(", ") + m.ToString());
                        else
                        {
                            var startIndex = lines.FindLastIndex(s => s.Contains("export function start")).NotFoundToNull() ?? 0;
                            lines.Insert(startIndex, "import { " + mod.Types.Select(a => a.Name).ToString(", ") + " } from './" + mod.Types[0].Namespace! + "';");
                        }
                    }

                    File.WriteAllLines(clientFile, lines);
                }
                else
                {
                    WriteFile(() => WriteClientFile(mod), () => GetClientFile(mod), ref overwriteFiles);
                }

                foreach (var t in mod.Types)
                {
                    WriteFile(() => WriteEntityComponentFile(t), () => GetViewFileName(mod, t), ref overwriteFiles);
                }
            }
            else
            {
                WriteFile(() => WriteClientFile(mod), () => GetClientFile(mod), ref overwriteFiles);
                WriteFile(() => WriteTypingsFile(mod), () => GetTypingsFile(mod), ref overwriteFiles);

                foreach (var t in mod.Types)
                {
                    WriteFile(() => WriteEntityComponentFile(t), () => GetViewFileName(mod, t), ref overwriteFiles);
                }

                WriteFile(() => WriteServerFile(mod), () => ServerFileName(mod), ref overwriteFiles);
                WriteFile(() => WriteControllerFile(mod), () => ControllerFileName(mod), ref overwriteFiles);
            }
        }
    }

    protected virtual void WriteFile(Func<string?> getContent, Func<string> getFileName, ref bool? overwriteFiles)
    {
        var content = getContent();
        if (content == null)
            return;


        var fileName = getFileName();

        FileTools.CreateParentDirectory(fileName);
        if (!File.Exists(fileName) || SafeConsole.Ask(ref overwriteFiles, "Overwrite {0}?".FormatWith(fileName)))
            File.WriteAllText(fileName, content, Encoding.UTF8);
    }

    protected virtual string GetProjectFolder()
    {
        return Path.Combine(SolutionFolder, SolutionName + ".React");
    }

    protected virtual void GetSolutionInfo(out string solutionFolder, out string solutionName)
    {
        CodeGenerator.GetSolutionInfo(out solutionFolder, out solutionName);
    }

    protected virtual string ServerFileName(Module m)
    {
        return BaseFileName(m) + m.ModuleName + "Server.cs";
    }

    protected virtual string GetViewFileName(Module m, Type t)
    {
        return BaseFileName(m) + "Templates\\" + GetComponentName(t) + ".tsx";
    }

    protected virtual string ControllerFileName(Module m)
    {
        return BaseFileName(m) + m.ModuleName + "Controller.cs";
    }

    protected virtual string GetClientFile(Module m)
    {
        return BaseFileName(m) + m.ModuleName + "Client.tsx";
    }

    protected virtual string GetTypingsFile(Module m)
    {
        return BaseFileName(m) + m.Types.First().Namespace + ".t4s";
    }

    protected virtual string BaseFileName(Module m)
    {
        return Path.Combine(GetProjectFolder(), "App\\" + m.ModuleName + "\\");
    }

    protected virtual IEnumerable<Module> GetModules()
    {
        var files = Directory.GetFiles(Path.Combine(GetProjectFolder(), "App"), "*.tsx", new EnumerationOptions { RecurseSubdirectories = true }).GroupToDictionary(a => Path.GetFileNameWithoutExtension(a));

        Dictionary<Type, bool> types = CandidateTypes().ToDictionary(a => a, a => files.ContainsKey(a.Name) || files.ContainsKey(Reflector.CleanTypeName(a)));

        return ReactGetModules(types, this.SolutionName);
    }

    public IEnumerable<Module> ReactGetModules(Dictionary<Type, bool> types, string solutionName)
    {
        while (true)
        {
            var typesToShow = types.Keys.OrderBy(a => a.FullName).ToList();

            var selectedTypes = new ConsoleSwitch<int, Type>("Chose types for a new React module:")
                .Load(typesToShow)
                .Do(cs => cs.PrintOption = (key, vwd) =>
                {
                    var used = types.GetOrThrow(vwd.Value);

                    SafeConsole.WriteColor(used ? ConsoleColor.DarkGray : ConsoleColor.White, " " + key);
                    SafeConsole.WriteLineColor(used ? ConsoleColor.DarkGray : ConsoleColor.Gray, " - " + vwd.Description);
                })
                .ChooseMultiple();

            if (selectedTypes.IsNullOrEmpty())
                yield break;

            var modules = selectedTypes.GroupBy(a =>  a.Namespace!.After(this.SolutionName + ".Entities").DefaultText(this.SolutionName))
                .Select(gr => new Module(gr.Key.TryAfterLast(".") ?? gr.Key, gr.ToList())).ToList();

            foreach (var m in modules)
            {
                yield return m;
            }

            types.SetRange(selectedTypes, a => a, a => true);
        }

    }

    protected virtual List<Type> CandidateTypes()
    {
        var assembly = Assembly.Load(Assembly.GetEntryAssembly()!.GetReferencedAssemblies().Single(a => a.Name == this.SolutionName + ".Entities"));

        return assembly.GetTypes().Where(t => t.IsModifiableEntity() && !t.IsAbstract && !typeof(MixinEntity).IsAssignableFrom(t)).ToList();
    }

    protected virtual string? WriteServerFile(Module mod)
    {
        if (!ShouldWriteServerFile(mod))
            return null;

        StringBuilder sb = new StringBuilder();
        foreach (var item in GetServerUsingNamespaces(mod))
            sb.AppendLine("using {0};".FormatWith(item));

        sb.AppendLine();
        sb.AppendLine("namespace " + GetServerNamespace(mod) + ";");
        sb.AppendLine();
        sb.Append(WriteServerClass(mod));

        return sb.ToString();
    }

    protected virtual bool ShouldWriteServerFile(Module mod)
    {
        return SafeConsole.Ask($"Write Server File for {mod.ModuleName}?");
    }

    protected virtual string GetServerNamespace(Module mod)
    {
        return SolutionName + ".React." + mod.ModuleName;
    }

    protected virtual string WriteServerClass(Module mod)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("public static class " + mod.ModuleName + "Server");
        sb.AppendLine("{");

        sb.AppendLine();

        sb.Append(WriteServerStartMethod(mod).Indent(2));

        sb.AppendLine("}");
        return sb.ToString();
    }

    protected virtual string WriteServerStartMethod(Module mod)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("public static void Start()");
        sb.AppendLine("{");
        sb.AppendLine("}");

        return sb.ToString();
    }


    protected virtual string? WriteControllerFile(Module mod)
    {
        if (!ShouldWriteControllerFile(mod))
            return null;

        StringBuilder sb = new StringBuilder();
        foreach (var item in GetServerUsingNamespaces(mod))
            sb.AppendLine("using {0};".FormatWith(item));

        sb.AppendLine();
        sb.AppendLine("namespace " + GetServerNamespace(mod) + ";");
        sb.AppendLine();
        sb.Append(WriteControllerClass(mod));

        return sb.ToString();
    }

    protected virtual bool ShouldWriteControllerFile(Module mod)
    {
        return SafeConsole.Ask($"Write Controller File for {mod.ModuleName}?");
    }

    protected virtual string WriteControllerClass(Module mod)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("public class " + mod.ModuleName + "Controller : ControllerBase");
        sb.AppendLine("{");

        sb.AppendLine();

        sb.Append(WriteControllerExampleMethod(mod).Indent(2));

        sb.AppendLine("}");
        return sb.ToString();
    }

    protected virtual string WriteControllerExampleMethod(Module mod)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine($"//[Route(\"api/{mod.ModuleName.ToLower()}/login\"), HttpPost]");
        sb.AppendLine(@"//public MyResponse Login([Required, FromBody]MyRequest data)");
        sb.AppendLine(@"//{");
        sb.AppendLine(@"//}");
        return sb.ToString();
    }


    protected virtual List<string> GetServerUsingNamespaces(Module mod)
    {
        var result = new List<string>()
        {
        };

        result.AddRange(mod.Types.Select(t => t.Namespace!).Distinct());

        return result;
    }


    protected virtual string WriteClientFile(Module mod)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("import * as React from 'react'");
        sb.AppendLine("import { Route, RouteObject } from 'react-router'");
        sb.AppendLine("import { ajaxPost, ajaxGet } from '@framework/Services';");
        sb.AppendLine("import { EntitySettings, ViewPromise } from '@framework/Navigator'");
        sb.AppendLine("import * as Navigator from '@framework/Navigator'");
        sb.AppendLine("import { EntityOperationSettings } from '@framework/Operations'");
        sb.AppendLine("import * as Operations from '@framework/Operations'");

        foreach (var gr in mod.Types.GroupBy(a => a.Namespace))
        {
            sb.AppendLine("import { "
                + gr.Select(t => t.Name).Chunk(5).ToString(a => a.ToString(", "), ",\r\n")
                + " } from './" + gr.Key + "'");
        }

        sb.AppendLine();
        sb.AppendLine(WriteClientStartMethod(mod));

        return sb.ToString();
    }

    protected virtual string WriteTypingsFile(Module mod)
    {
        return "";
    }

    protected virtual string WriteClientStartMethod(Module mod)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("export function start(options: { routes: RouteObject[] }) {");
        sb.AppendLine("");

        string entitySettings = WritetEntitySettings(mod);
        if (entitySettings != null)
            sb.Append(entitySettings.Indent(2));

        sb.AppendLine();

        string operationSettings = WriteOperationSettings(mod);
        if (operationSettings != null)
            sb.Append(operationSettings.Indent(2));

        sb.AppendLine("}");

        return sb.ToString();
    }

    protected virtual string WritetEntitySettings(Module mod)
    {
        StringBuilder sb = new StringBuilder();

        foreach (var t in mod.Types)
        {
            string es = GetEntitySetting(t);
            if (es != null)
                sb.AppendLine(es);
        }
        return sb.ToString();
    }

    protected virtual string GetEntitySetting(Type type)
    {
        var v = GetVarName(type);

        return "Navigator.addSettings(new EntitySettings({0}, {1} => import('./Templates/{2}')));".FormatWith(
            type.Name, v, GetComponentName(type));
    }

    protected virtual string GetVarName(Type type)
    {
        return type.Name.Substring(0, 1).ToLower();
    }

    protected virtual string WriteOperationSettings(Module mod)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("//Operations.addSettings(new EntityOperationSettings(MyEntityOperations.Save, {}));");
        return sb.ToString();
    }


    protected virtual string GetComponentName(Type type)
    {
        return Reflector.CleanTypeName(type);
    }


    protected virtual string WriteEntityComponentFile(Type type)
    {
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("import * as React from 'react'");
        sb.AppendLine("import { " + type.Name + " } from '../" + type.Namespace + "'");
        sb.AppendLine("import { TypeContext, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, EntityTable, FormGroup } from '@framework/Lines'");
        sb.AppendLine("import { SearchControl, SearchValue, FilterOperation, OrderType, PaginationMode } from '@framework/Search'");

        var v = GetVarName(type);


        if (this.GenerateFunctionalComponent(type))
        {
            sb.AppendLine();
            sb.AppendLine("export default function {0}(p: {{ ctx: TypeContext<{1}> }}) {{".FormatWith(GetComponentName(type), type.Name));
            sb.AppendLine("");
            sb.AppendLine("  var ctx = p.ctx;");
            sb.AppendLine("  return (");
            sb.AppendLine("    <div>");

            foreach (var pi in GetProperties(type))
            {
                string? prop = WriteProperty(pi, v);
                if (prop != null)
                    sb.AppendLine(prop.Indent(6));
            }

            sb.AppendLine("     </div>");
            sb.AppendLine("  );");
            sb.AppendLine("}");
        }
        else
        {
            sb.AppendLine();
            sb.AppendLine("export default class {0} extends React.Component<{{ ctx: TypeContext<{1}> }}> {{".FormatWith(GetComponentName(type), type.Name));
            sb.AppendLine("");
            sb.AppendLine("  render() {");
            sb.AppendLine("    var ctx = this.props.ctx;");
            sb.AppendLine("    return (");
            sb.AppendLine("      <div>");

            foreach (var pi in GetProperties(type))
            {
                string? prop = WriteProperty(pi, v);
                if (prop != null)
                    sb.AppendLine(prop.Indent(8));
            }

            sb.AppendLine("       </div>");
            sb.AppendLine("    );");
            sb.AppendLine("  }");
            sb.AppendLine("}");
        }

        return sb.ToString();
    }

    protected virtual bool GenerateFunctionalComponent(Type type)
    {
        return true;
    }

    protected virtual string? WriteProperty(PropertyInfo pi, string v)
    {
        if (pi.PropertyType.IsLite() || pi.PropertyType.IsIEntity())
            return WriteEntityProperty(pi, v);

        if (pi.PropertyType.IsEmbeddedEntity())
            return WriteEmbeddedProperty(pi, v);

        if (pi.PropertyType.IsMList())
            return WriteMListProperty(pi, v);

        if (IsValue(pi.PropertyType))
            return WriteValueLine(pi, v);

        return null;
    }

    protected virtual string WriteMListProperty(PropertyInfo pi, string v)
    {
        var elementType = pi.PropertyType.ElementType()!.CleanType();

        if (!(elementType.IsLite() || elementType.IsModifiableEntity()))
            return $"{{ /* {pi.PropertyType.TypeName()} not supported */ }}";

        var eka = elementType.GetCustomAttribute<EntityKindAttribute>();

        if (elementType.IsEmbeddedEntity() || !pi.PropertyType.ElementType()!.IsLite() && (eka!.EntityKind == EntityKind.Part || eka!.EntityKind == EntityKind.SharedPart))
            if (pi.GetCustomAttribute<ImplementedByAttribute>()?.ImplementedTypes.Length > 1)
                return "<EntityRepeater ctx={{ctx.subCtx({0} => {0}.{1})}} />".FormatWith(v, pi.Name.FirstLower());
            else
                return "<EntityTable ctx={{ctx.subCtx({0} => {0}.{1})}} />".FormatWith(v, pi.Name.FirstLower());

        return "<EntityStrip ctx={{ctx.subCtx({0} => {0}.{1})}} />".FormatWith(v, pi.Name.FirstLower());
    }

    protected virtual string WriteEmbeddedProperty(PropertyInfo pi, string v)
    {
        return "<EntityDetail ctx={{ctx.subCtx({0} => {0}.{1})}} />".FormatWith(v, pi.Name.FirstLower());
    }

    protected virtual string WriteEntityProperty(PropertyInfo pi, string v)
    {
        Type type = pi.PropertyType.CleanType();

        var eka = type.GetCustomAttribute<EntityKindAttribute>();

        if (eka == null)
            return "<EntityLine ctx={{ctx.subCtx({0} => {0}.{1})}} />".FormatWith(v, pi.Name.FirstLower());

        if (!pi.PropertyType.IsLite() && (eka.EntityKind == EntityKind.Part || eka.EntityKind == EntityKind.SharedPart))
            return "<EntityDetail ctx={{ctx.subCtx({0} => {0}.{1})}} />".FormatWith(v, pi.Name.FirstLower());

        if (eka.IsLowPopulation)
            return "<EntityCombo ctx={{ctx.subCtx({0} => {0}.{1})}} />".FormatWith(v, pi.Name.FirstLower());

        return "<EntityLine ctx={{ctx.subCtx({0} => {0}.{1})}} />".FormatWith(v, pi.Name.FirstLower());
    }


    protected virtual bool IsValue(Type type)
    {
        type = type.UnNullify();

        if (type.IsEnum)
            return true;

        if (type == typeof(TimeSpan) || type == typeof(DateOnly) || type == typeof(TimeOnly) || type == typeof(DateTimeOffset) || type == typeof(Guid))
            return true;

        TypeCode tc = Type.GetTypeCode(type);

        return tc != TypeCode.DBNull &&
            tc != TypeCode.Empty &&
            tc != TypeCode.Object;
    }

    protected virtual string WriteValueLine(PropertyInfo pi, string v)
    {
        return "<ValueLine ctx={{ctx.subCtx({0} => {0}.{1})}} />".FormatWith(v, pi.Name.FirstLower());
    }

    protected virtual IEnumerable<PropertyInfo> GetProperties(Type type)
    {
        return Reflector.PublicInstanceDeclaredPropertiesInOrder(type).Where(pi =>
        {
            var ts = pi.GetCustomAttribute<InTypeScriptAttribute>();
            if (ts != null)
            {
                var inTS = ts.GetInTypeScript();

                if (inTS != null)
                    return inTS.Value;
            }

            if (pi.HasAttribute<HiddenPropertyAttribute>() || pi.HasAttribute<ExpressionFieldAttribute>())
                return false;

            return true;
        });
    }

}
