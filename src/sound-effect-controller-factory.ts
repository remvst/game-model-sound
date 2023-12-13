import { World, WorldEvent } from '@remvst/game-model';
import { SoundEffectController } from './sound-effect-controller';

export interface SoundEffectControllerFactory {
    controllersForEvent(event: WorldEvent, world: World): SoundEffectController<WorldEvent>[];
}

export class MuteSoundEffectControllerFactory implements SoundEffectControllerFactory {
    controllersForEvent(event: WorldEvent): SoundEffectController<WorldEvent>[] {
        return [];
    }
}