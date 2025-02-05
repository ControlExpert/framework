import * as React from 'react'
import { ValueLine, EntityRepeater, EntityDetail } from '@framework/Lines'
import { TypeContext } from '@framework/TypeContext'
import { SmtpNetworkDeliveryEmbedded, ClientCertificationFileEmbedded, SmtpEmailServiceEntity, } from '../../Signum.Mailing'
export default function SmtpEmailService(p: { ctx: TypeContext<SmtpEmailServiceEntity> }) {
  const sc = p.ctx;

  return (
    <div>
      <ValueLine ctx={sc.subCtx(s => s.deliveryFormat)} />
      <ValueLine ctx={sc.subCtx(s => s.deliveryMethod)} />
      <ValueLine ctx={sc.subCtx(s => s.pickupDirectoryLocation)} />
      <EntityDetail ctx={sc.subCtx(s => s.network)} getComponent={(net: TypeContext<SmtpNetworkDeliveryEmbedded>) =>
        <div>
          <ValueLine ctx={net.subCtx(s => s.port)} />
          <ValueLine ctx={net.subCtx(s => s.host)} />
          <ValueLine ctx={net.subCtx(s => s.useDefaultCredentials)} />
          <ValueLine ctx={net.subCtx(s => s.username)} />
          <ValueLine ctx={net.subCtx(s => s.password)} valueLineType="Password" />
          <ValueLine ctx={net.subCtx(s => s.enableSSL)} />
          <EntityRepeater ctx={net.subCtx(s => s.clientCertificationFiles)} getComponent={(cert: TypeContext<ClientCertificationFileEmbedded>) =>
            <div>
              <ValueLine ctx={cert.subCtx(s => s.certFileType)} />
              <ValueLine ctx={cert.subCtx(s => s.fullFilePath)} />
            </div>
          } />
        </div>
      } />
    </div>
  );
}

