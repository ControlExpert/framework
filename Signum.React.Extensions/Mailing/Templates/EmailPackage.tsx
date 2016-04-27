﻿import * as React from 'react'
import { classes } from '../../../../Framework/Signum.React/Scripts/Globals'
import { FormGroup, FormControlStatic, EntityComponent, ValueLine, ValueLineType, EntityLine, EntityCombo, EntityList, EntityRepeater, EntityFrame, EntityTabRepeater} from '../../../../Framework/Signum.React/Scripts/Lines'
import { SearchControl }  from '../../../../Framework/Signum.React/Scripts/Search'
import { getToString }  from '../../../../Framework/Signum.React/Scripts/Signum.Entities'
import { TypeContext, FormGroupStyle } from '../../../../Framework/Signum.React/Scripts/TypeContext'
import { EmailPackageEntity, EmailMessageEntity} from '../Signum.Entities.Mailing'

export default class EmailPackage extends EntityComponent<EmailPackageEntity> {

    renderEntity() {

        var e = this.props.ctx;

        return (
            <div>
                <ValueLine ctx={e.subCtx(f => f.name) } readOnly={true} />
                <fieldset>
                    <legend>{EmailMessageEntity.nicePluralName()}</legend>
                    <SearchControl findOptions={{
                        queryName: EmailMessageEntity,
                        parentColumn: "package",
                        parentValue: e.value
                    }}/>
                </fieldset>
            </div>
        );
    }
}

