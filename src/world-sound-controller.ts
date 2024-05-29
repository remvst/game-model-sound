import { World, WorldEvent } from "@remvst/game-model";
import { Subscription } from "rxjs";
import { SoundEffectController } from "./sound-effect-controller";
import { SoundEffectControllerFactory } from "./sound-effect-controller-factory";

export class WorldSoundController {
    readonly world: World;
    private subscriptions: Subscription[] = [];

    private readonly soundEffectControllerFactory: SoundEffectControllerFactory;

    private soundEffectControllers: SoundEffectController<any>[] = [];
    private readonly collapsableControllers = new Map<
        string,
        SoundEffectController<any>
    >();

    age: number = 0;

    volume: number = 1;
    rate: number = 1;

    constructor(options: {
        world: World;
        soundEffectControllerFactory: SoundEffectControllerFactory;
    }) {
        this.world = options.world;
        this.soundEffectControllerFactory =
            options.soundEffectControllerFactory;
    }

    setVolume(volume: number) {
        this.volume = volume;
        for (const controller of this.soundEffectControllers) {
            controller.setMasterVolume(volume);
        }
    }

    setRate(rate: number) {
        if (rate === this.rate) {
            return;
        }

        this.rate = rate;
        for (const controller of this.soundEffectControllers) {
            controller.setRate(rate);
        }
    }

    start() {
        this.stop();

        this.subscriptions = [
            this.world.events.subscribe((event) => this.onEvent(event)),
        ];
    }

    stop() {
        const controllers = this.soundEffectControllers.slice(0);
        const subscriptions = this.subscriptions.slice(0);

        this.subscriptions = [];
        this.soundEffectControllers = [];
        this.collapsableControllers.clear();

        for (const controller of controllers) {
            controller.tearDown();
        }
        for (const subscription of subscriptions) {
            subscription.unsubscribe();
        }
    }

    update(elapsed: number) {
        this.age += elapsed;
        this.soundEffectControllers.forEach((controller) =>
            controller.update(),
        );
    }

    private removeSoundEffectController(
        controller: SoundEffectController<any>,
    ) {
        controller.tearDown();

        const index = this.soundEffectControllers.indexOf(controller);
        if (index >= 0) {
            this.soundEffectControllers.splice(index, 1);
        }

        const { collapseGroup } = controller;
        this.collapsableControllers.delete(collapseGroup);
    }

    private onEvent(event: WorldEvent) {
        const soundEffectControllers =
            this.soundEffectControllerFactory.controllersForEvent(
                event,
                this.world,
            );
        for (const controller of soundEffectControllers) {
            this.addSoundEffectController(controller);
        }
    }

    addSoundEffectController(controller: SoundEffectController<any>) {
        const { collapseGroup, collapseToNewest } = controller;
        if (collapseGroup) {
            const existing = this.collapsableControllers.get(collapseGroup);
            if (existing) {
                if (!collapseToNewest) return;
                this.removeSoundEffectController(existing);
            }
            this.collapsableControllers.set(collapseGroup, controller);
        }

        controller.setMasterVolume(this.volume);
        controller.setRate(this.rate);
        controller.bind(this, event);
        controller.postBind();

        this.soundEffectControllers.push(controller);

        controller.removeEmitter().then(() => {
            this.removeSoundEffectController(controller);
        });
    }

    pause() {
        for (const controller of this.soundEffectControllers) {
            controller.pause();
        }
    }

    resume() {
        for (const controller of this.soundEffectControllers) {
            controller.resume();
        }
    }
}
