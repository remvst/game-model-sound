import { WorldEvent } from "@remvst/game-model";
import { HowlSoundEffectController } from "./howl-sound-effect-controller";

export class SimpleSoundEffectController<
    EventType extends WorldEvent,
> extends HowlSoundEffectController<EventType> {
    postBind(): void {
        super.postBind();
        this.resume();
        this.updatePosition();
    }

    protected onHowlEnd() {
        this.removeCallback?.();
    }
}
