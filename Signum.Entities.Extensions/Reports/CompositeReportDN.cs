﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using Signum.Entities.Basics;
using Signum.Entities.Extensions.Properties;
using Signum.Utilities;

namespace Signum.Entities.Reports
{
    [Serializable, LocDescription]
    public class CompositeReportDN : IdentifiableEntity
    {
        [NotNullable, SqlDbType(Size = 200)]
        string name;
        [StringLengthValidator(AllowNulls = false, Min = 1, Max = 200), LocDescription]
        public string Name
        {
            get { return name; }
            set { Set(ref name, value, "Name"); }
        }
        
        MList<Lazy<ExcelReportDN>> excelReports;
        [LocDescription]
        public MList<Lazy<ExcelReportDN>> ExcelReports
        {
            get { return excelReports; }
            set { Set(ref excelReports, value, "Excelreports"); }
        }

        public override string ToString()
        {
            return name ;
        }
    }
}
