using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using Signum.Utilities;

namespace Signum.Engine.Linq
{
    internal class SqlCastLazyRemover : DbExpressionVisitor
    {
        SelectExpression? currentSelect;
        ColumnGenerator? cg;

        static internal Expression Remove(Expression expression)
        {
            return new SqlCastLazyRemover().Visit(expression);
        }

        protected internal override Expression VisitProjection(ProjectionExpression proj)
        {
            var oldCg = this.cg;
            var oldSelect = this.currentSelect;
            try
            {
                var s = this.currentSelect = proj.Select;

                Expression projector = this.Visit(proj.Projector);


                SelectExpression source = this.cg == null ? proj.Select :
                    new SelectExpression(s.Alias, s.IsDistinct, s.Top, this.cg.Columns.NotNull(), s.From, s.Where, s.OrderBy, s.GroupBy, s.SelectOptions);

                if (source != proj.Select || projector != proj.Projector)
                    return new ProjectionExpression(source, projector, proj.UniqueFunction, proj.Type);

                return proj;
            }
            finally
            {
                this.cg = oldCg;
                this.currentSelect = oldSelect;
            }
        }

        protected internal override Expression VisitSqlCastLazy(SqlCastLazyExpression castExpr)
        {
            if(this.cg == null)
                this.cg = new ColumnGenerator(this.currentSelect!.Columns);

            var cd = cg.NewColumn(new SqlCastExpression(castExpr.Type, castExpr.Expression, castExpr.DbType));

            return new ColumnExpression(cd.Expression.Type, this.currentSelect!.Alias, cd.Name);
        }
    }
}
