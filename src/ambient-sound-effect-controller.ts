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

    protected onHowlStart(): void {
        super.onHowlStart();
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
}
