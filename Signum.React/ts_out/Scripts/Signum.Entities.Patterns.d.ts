import { MessageKey } from './Reflection';
import * as Entities from './Signum.Entities';
export declare module EntityMessage {
    const AttemptToSet0InLockedEntity1: MessageKey;
    const AttemptToAddRemove0InLockedEntity1: MessageKey;
}
export interface LockableEntity extends Entities.Entity {
    locked?: boolean;
}
//# sourceMappingURL=Signum.Entities.Patterns.d.ts.map