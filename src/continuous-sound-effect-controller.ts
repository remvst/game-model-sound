import { WorldEvent } from "@remvst/game-model";
import {
    HowlOrHowlAndSprite,
    HowlSoundEffectController,
} from "./howl-sound-effect-controller";

export class ContinuousSoundEffectController<
    EventType extends WorldEvent,
> extends HowlSoundEffectController<EventType> {
    constructor(
        howlsAndSprites: HowlOrHowlAndSprite[],
        refRelativeDistance: number = 1,
        private readonly keepPlaying: () => boolean,
    ) {
        super(howlsAndSprites, refRelativeDistance);
    }

    resume(): void {
        super.resume();
        this.howl.loop(true, this.howlId);
    }

    update() {
        super.update();

        if (!this.keepPlaying()) {
            this.removeCallback?.();
        }
    }

    protected onHowlEnd(): void {
        // no-op
    }
}
