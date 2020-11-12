using Signum.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace Signum.Upgrade
{
    public class CodeFile
    {
        public bool ShowWarnings { get; set; }

        public CodeFile(string filePath, UpgradeContext uctx)
        {
            this.FilePath = filePath;
            this.Uctx = uctx;
        }

        public override string ToString() => FilePath;

        public string FilePath { get; }
        public UpgradeContext Uctx { get; }

        string? _content;
        string? _originalContent; 
        public string Content
        {
            get { ReadIfNecessary(); return _content!; }
            set { _content = value; }
        }

        private void ReadIfNecessary()
        {
            if(_content == null)
            {
                _originalContent = _content = File.ReadAllText(Path.Combine(Uctx.RootFolder, FilePath), GetEncoding(FilePath));
            }
        }

        public void SafeIfNecessary()
        {
            if (_content == null)
                return;

            if (_content == _originalContent)
                return;

            SafeConsole.WriteLineColor(ConsoleColor.DarkGray, "Modified " + FilePath);
            File.WriteAllText(Path.Combine(this.Uctx.RootFolder, FilePath), _content, GetEncoding(FilePath));
        }

        Encoding GetEncoding(string filePath)
        {
            return Encoding.UTF8;
        }

        public void Replace(string searchFor, string replaceBy)
        {
            var newContent = this.Content.Replace(searchFor, replaceBy);

            if (newContent == this.Content)
                Warning($"Unable to replace '{searchFor}' by '{replaceBy}'");

            this.Content = newContent;
        }

        bool isFirstWarning = true;
        public void Warning(FormattableString message)
        {
            if (!ShowWarnings)
                return;

            Uctx.HasWarnings = true;

            if (isFirstWarning)
            {
                SafeConsole.WriteLineColor(ConsoleColor.Yellow, "WARNING in " + this.FilePath);
                isFirstWarning = false;
            }

            Console.Write(" ");
            foreach (var (match, after) in new Regex(@"\{(?<num>\d+)\}").SplitAfter(message.Format))
            {
                if (match != null)
                    SafeConsole.WriteColor(ConsoleColor.White, message.GetArgument(int.Parse(match.Groups["num"].Value))?.ToString() ?? "");

                Console.Write(after);
            }

            Console.WriteLine();
        }

        public void Replace(Regex regex, Expression<MatchEvaluator> evaluator)
        {
            var newContent = regex.Replace(this.Content, evaluator.Compile());

            if (newContent == this.Content)
                Warning($"Unable to match {regex} to replace it by {evaluator}");

            this.Content = newContent;
        }

        //Waiting for https://github.com/dotnet/csharplang/issues/287
        public void RemoveAllLines(Expression<Predicate<string>> condition)
        {
            ProcessLines(lines =>
            {
                var res = lines.RemoveAll(condition.Compile());
                if(res == 0)
                {
                    Warning($"Unable to find any line where {condition} to remove it");
                    return false;
                }

                return true;
            });
        }

        public void InsertAfterFirstLine(Expression<Predicate<string>> condition, string otherLines)
        {
            ProcessLines(lines =>
            {
                var pos = lines.FindIndex(condition.Compile());
                if(pos == -1)
                {
                    Warning($"Unable to find line where {condition} the insert after {otherLines}");
                    return false;
                }
                var indent = GetIndent(lines[pos]);
                lines.InsertRange(pos + 1, otherLines.Lines().Select(a => indent + a.Replace("Southwind", this.Uctx.ApplicationName)));
                return true;
            });
        }

        string GetIndent(string v)
        {
            return Regex.Match(v, @"^\s*").Value;
        }

        /// <param name="fromLine">Not included</param>
        /// <param name="toLine">Not included</param>
        public void ReplaceBetween(Expression<Predicate<string>> fromLine, Expression<Predicate<string>> toLine, string otherLines
            )
        {
            ProcessLines(lines =>
            {
                var from = lines.FindIndex(fromLine.Compile());
                if (from == -1)
                {
                    Warning($"Unable to find a line where {fromLine} to insert after {otherLines}");
                    return false;
                }
                var to = lines.FindIndex(from + 1, toLine.Compile());
                if(to == -1)
                {
                    Warning($"Unable to find a line where {toLine} after line {to} to insert before {otherLines}");
                    return false;
                }
                var indent = GetIndent(lines[from]);
                lines.RemoveRange(from + 1, to - from - 1);
                lines.InsertRange(from + 1, otherLines.Lines().Select(a => indent + a.Replace("Southwind", this.Uctx.ApplicationName)));
                return true;
            });
        }

        public void ReplaceLine(Expression<Predicate<string>> condition, string otherLines)
        {
            ProcessLines(lines =>
            {
                var pos = lines.FindIndex(condition.Compile());
                if (pos == -1)
                {
                    Warning($"Unable to find a line where {condition} to replace it by {otherLines}");
                    return false;
                }
                var indent = GetIndent(lines[pos]);
                lines.RemoveRange(pos, 1);
                lines.InsertRange(pos, otherLines.Lines().Select(a => indent + a.Replace("Southwind", this.Uctx.ApplicationName)));
                return true;
            });
        }

        public void InsertBeforeFirstLine(Expression<Predicate<string>> condition, string otherLines)
        {
            ProcessLines(lines =>
            {
                var pos = lines.FindIndex(condition.Compile());
                if (pos == -1)
                {
                    Warning($"Unable to find a line where {condition} to insert before {otherLines}");
                    return false;
                }
                var indent = GetIndent(lines[pos]);
                lines.InsertRange(pos, otherLines.Lines().Select(a => indent + a.Replace("Southwind", this.Uctx.ApplicationName)));
                return true;
            });
        }

        public void InsertAfterLastLine(Expression<Predicate<string>> condition, string otherLines)
        {
            ProcessLines(lines =>
            {
                var pos = lines.FindLastIndex(condition.Compile());
                if (pos == -1)
                {
                    Warning($"Unable to find a line where {condition} to insert after {otherLines}");
                    return false;
                }
                var indent = GetIndent(lines[pos]);
                lines.InsertRange(pos + 1, otherLines.Lines().Select(a => indent + a.Replace("Southwind", this.Uctx.ApplicationName)));
                return true;
            });
        }

        public void InsertBeforeLastLine(Expression<Predicate<string>> condition, string otherLines)
        {
            ProcessLines(lines =>
            {
                var pos = lines.FindLastIndex(condition.Compile());
                if (pos == -1)
                {
                    Warning($"Unable to find a line where {condition} to insert before {otherLines}");
                    return false;
                }
                var indent = GetIndent(lines[pos]);
                lines.InsertRange(pos, otherLines.Lines().Select(a => indent + a.Replace("Southwind", this.Uctx.ApplicationName)));
                return true;
            });
        }

        public void ProcessLines(Func<List<string>, bool> process)
        {
            var separator = this.Content.Contains("\r\n") ? "\r\n" : "\n";
            var lines = this.Content.Split(separator).ToList();

            if (process(lines))
            {
                this.Content = lines.ToString(separator);
            }
        }

        private void AssertExtension(params string[] extension)
        {
            var ext = Path.GetExtension(this.FilePath);

            if (!extension.Any(e => e.Equals(ext, StringComparison.InvariantCulture)))
                throw new InvalidOperationException("");
        }

        public bool UpdateNugetReference(string packageName, string version)
        {
            AssertExtension(".csproj");

            var doc = XDocument.Parse(this.Content, LoadOptions.PreserveWhitespace);

            var elem = doc.Root!.Elements("ItemGroup").SelectMany(a => a.Elements("PackageReference"))
                .FirstOrDefault(a => a.Attribute("Include")?.Value == packageName);

            if (elem == null)
            {
                Warning($"Unable to find reference to Nuget {packageName} to update it to {version}");
                return false;
            }

            elem.Attribute("Version")!.Value = version;

            this.Content = doc.ToString(SaveOptions.DisableFormatting);

            return true;
        }

        public bool RemoveNugetReference(string packageName)
        {
            AssertExtension(".csproj");

            var doc = XDocument.Parse(this.Content, LoadOptions.PreserveWhitespace);

            var eleme = doc.Root!.Elements("ItemGroup").SelectMany(a => a.Elements("PackageReference"))
                .FirstOrDefault(a => a.Attribute("Include")?.Value == packageName);

            if (eleme == null)
            {
                Warning($"Unable to remove reference to Nuget {packageName} because is not found");
                return false;
            }

            eleme.Remove();

            this.Content = doc.ToString(SaveOptions.DisableFormatting);

            return true;
        }

        public bool AddNugetReference(string packageName, string version)
        {
            AssertExtension(".csproj");

            var doc = XDocument.Parse(this.Content, LoadOptions.PreserveWhitespace);

            var itemGroup = doc.Root!.Elements("ItemGroup").FirstEx();

            itemGroup.Add(new XElement("PackageReference",
                new XAttribute("Include", packageName),
                new XAttribute("Include", version)
            ));

            this.Content = doc.ToString(SaveOptions.DisableFormatting);

            return true;
        }
    }

}
