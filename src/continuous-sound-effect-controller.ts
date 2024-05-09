import { WorldEvent } from "@remvst/game-model";
import {
    HowlOrHowlAndSprite,
    SimpleSoundEffectController,
} from "./simple-sound-effect-controller";

export class ContinuousSoundEffectController<
    EventType extends WorldEvent,
> extends SimpleSoundEffectController<EventType> {
    constructor(
        howlsAndSprites: HowlOrHowlAndSprite[],
        refRelativeDistance: number = 1,
        private readonly keepPlaying: () => boolean,
    ) {
        super(howlsAndSprites, refRelativeDistance);
    }

    update() {
        super.update();

        if (!this.keepPlaying()) {
            this.removeCallback?.();
        }
    }
}
