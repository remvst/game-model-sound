import {
    HowlOrHowlAndSprite,
    HowlSoundEffectController,
} from "./howl-sound-effect-controller";

export class AmbientSoundEffectController extends HowlSoundEffectController<null> {
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
            this.pause();
        } else {
            this.resume();
        }
    }

    protected onHowlEnd(): void {
        // no-op
    }
}
