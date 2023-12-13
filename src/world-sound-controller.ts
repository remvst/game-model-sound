import { World, WorldEvent } from '@remvst/game-model';
import { SoundEffectController } from './sound-effect-controller';
import { SoundEffectControllerFactory } from './sound-effect-controller-factory';
import { Subscription } from 'rxjs';

export class WorldSoundController {

    readonly world: World;
    private subscriptions: Subscription[] = [];

    private readonly soundEffectControllerFactory: SoundEffectControllerFactory;

    private soundEffectControllers: SoundEffectController<any>[] = [];
    private readonly collapsableControllers = new Map<string, SoundEffectController<any>>();

    private soundEffectsEnabled = true;

    age: number = 0;

    volume: number = 1;
    rate: number = 1;

    constructor(options: {
        world: World,
        soundEffectControllerFactory: SoundEffectControllerFactory,
    }) {
        this.world = options.world;
        this.soundEffectControllerFactory = options.soundEffectControllerFactory;
    }

    setVolume(volume: number) {
        this.volume = volume;
        for (const controller of this.soundEffectControllers) {
            controller.setVolume(volume);
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
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];

        for (const controller of this.soundEffectControllers.slice(0)) {
            controller.tearDown();
        }
        this.soundEffectControllers.splice(0, this.soundEffectControllers.length);
    }

    update(elapsed: number) {
        this.age += elapsed;
        this.soundEffectControllers.forEach((controller) => controller.update());
    }

    private removeSoundEffectController(controller: SoundEffectController<any>) {
        controller.tearDown();

        const index = this.soundEffectControllers.indexOf(controller);
        if (index >= 0) {
            this.soundEffectControllers.splice(index, 1);
        }

        const { collapseGroup } = controller;
        this.collapsableControllers.delete(collapseGroup);
    }

    private onEvent(event: WorldEvent) {
        if (!this.soundEffectsEnabled) {
            return;
        }

        const soundEffectControllers = this.soundEffectControllerFactory.controllersForEvent(event, this.world);
        for (const controller of soundEffectControllers) {
            this.addSoundEffectController(controller);
        }
    }

    private addSoundEffectController(controller: SoundEffectController<any>) {
        const { collapseGroup, collapseToNewest } = controller;
        if (collapseGroup) {
            const existing = this.collapsableControllers.get(collapseGroup);
            if (existing) {
                if (!collapseToNewest) return;
                this.removeSoundEffectController(existing);
            }
            this.collapsableControllers.set(collapseGroup, controller);
        }

        controller.setVolume(this.volume);
        controller.setRate(this.rate);
        controller.bind(this, event);
        controller.postBind();

        this.soundEffectControllers.push(controller);

        controller.removeEmitter().then(() => {
            this.removeSoundEffectController(controller);
        });
    }

    pause() {
        this.soundEffectControllers.slice(0).forEach(controller => controller.pause());
    }

    resume() {
        this.soundEffectControllers.slice(0).forEach(controller => controller.resume());
    }
}
