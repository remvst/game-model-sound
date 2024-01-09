import { WorldEvent } from "@remvst/game-model";
import { Howl } from "howler";
import { SimpleSoundEffectController } from "./simple-sound-effect-controller";

export class ContinuousSoundEffectController<
    EventType extends WorldEvent,
> extends SimpleSoundEffectController<EventType> {
    constructor(
        howls: Howl[],
        refRelativeDistance: number = 1,
        private readonly keepPlaying: () => boolean,
    ) {
        super(howls, refRelativeDistance);
    }

    update() {
        super.update();

        if (!this.keepPlaying()) {
            this.removeCallback?.();
        }
    }
}
