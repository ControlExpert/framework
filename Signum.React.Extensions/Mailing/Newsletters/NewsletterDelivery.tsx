﻿import * as React from 'react'
import { classes } from '../../../../Framework/Signum.React/Scripts/Globals'
import { FormGroup, FormControlStatic, EntityComponent, ValueLine, ValueLineType, EntityLine, EntityCombo, EntityList, EntityRepeater, EntityFrame, EntityTabRepeater, EntityDetail} from '../../../../Framework/Signum.React/Scripts/Lines'
import { SearchControl, CountSearchControl }  from '../../../../Framework/Signum.React/Scripts/Search'
import { getToString }  from '../../../../Framework/Signum.React/Scripts/Signum.Entities'
import { ExceptionEntity }  from '../../../../Framework/Signum.React/Scripts/Signum.Entities.Basics'
import { TypeContext, FormGroupStyle } from '../../../../Framework/Signum.React/Scripts/TypeContext'
import { NewsletterDeliveryEntity } from '../Signum.Entities.Mailing'
import { ProcessExceptionLineEntity } from '../../Processes/Signum.Entities.Processes'

export default class NewsletterDelivery extends EntityComponent<NewsletterDeliveryEntity> {

    renderEntity() {

         var nc = this.props.ctx;

        return (
            <div>
            	<ValueLine ctx={nc.subCtx(n => n.sent)}  />
	            <ValueLine ctx={nc.subCtx(n => n.sendDate)}  />
	            <EntityLine ctx={nc.subCtx(n => n.recipient)}  />
	            <EntityLine ctx={nc.subCtx(n => n.newsletter)}  />
                <SearchControl findOptions={{queryName: ProcessExceptionLineEntity, parentColumn: "Line", parentValue: nc.value}}/>
            </div>
        );
    }
}

