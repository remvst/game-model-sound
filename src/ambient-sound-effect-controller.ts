import {
    HowlOrHowlAndSprite,
    SimpleSoundEffectController,
} from "./simple-sound-effect-controller";

export class AmbientSoundEffectController extends SimpleSoundEffectController<null> {
    constructor(
        howlsAndSprites: HowlOrHowlAndSprite[],
        refRelativeDistance: number = 1,
        private readonly keepPlaying: () => boolean,
    ) {
        super(howlsAndSprites, refRelativeDistance);
    }

    postBind(): void {
        super.postBind();
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
