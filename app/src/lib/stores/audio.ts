import { writable } from 'svelte/store';
import type { Readable } from './types';

const audioLocation = '/audio/';

type ValidAudios = 'music_lobby.mp3' | 'sfx_abucheo.mp3' | 'sfx_aplauso.mp3' | 'sfx_meh.mp3' | 'sfx_round.mp3';

type AudioType = 'music' | 'sfx' | 'none';

type AudioState = {
    type: AudioType;
    track?: ValidAudios;
    audio?: HTMLAudioElement;
    isMuted: boolean;
    isPlaying: boolean;
    isPaused: boolean;
    volume: number;
    musicVolume: number;
    sfxVolume: number;
};

type AudioStore = Readable<AudioState> & {
    play: (track: ValidAudios, loop?: boolean) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    mute: () => void;
    unMute: () => void;
    setVolume: (volume: number) => void;
    setMusicVolume: (volume: number) => void;
    setSfxVolume: (volume: number) => void;
    preLoadAudio: (src: string) => void;
};

const cachedAudio = new Map<string, HTMLAudioElement>();

function normalizeVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume));
}

function getAudioType(track: string): AudioType {
    if (track.includes('music')) {
        return 'music';
    }
    if (track.includes('sfx')) {
        return 'sfx';
    }
    return 'none';
}


function createAudioStore(): AudioStore {
    const state: AudioState = {
        type: 'none',
        track: undefined,
        audio: undefined,
        isMuted: false,
        isPlaying: false,
        isPaused: false,
        volume: 1,
        musicVolume: 1,
        sfxVolume: 1,
    };
    const { subscribe, set } = writable(state);

    return {
        subscribe,
        play(track: string, loop: boolean = false) {
            let audio = cachedAudio.get(track);
            if (!audio) {
                audio = new Audio(`${audioLocation}${track}`);
                cachedAudio.set(track, audio);
            }
            state.type = getAudioType(track);
            state.audio = audio;
            state.isPlaying = true;
            state.isPaused = false;
            audio.volume = state.volume * (state.type === 'music' ? state.musicVolume : state.sfxVolume);
            audio.loop = loop;
            audio.muted = state.isMuted;
            audio.play();
            set(state);
        },
        pause() {
            state.isPaused = true;
            state.isPlaying = false;
            if (state.audio) {
                state.audio.pause();
            }
            set(state);
        },
        resume() {
            if (!state.audio || state.isPlaying) {
                return;
            }

            state.isPaused = false;
            state.isPlaying = true;
            state.audio.play();
            set(state);
        },
        stop() {
            state.isPlaying = false;
            state.isPaused = false;
            if (state.audio) {
                state.audio.pause();
                state.audio.currentTime = 0;
            }
            set(state);
        },
        mute() {
            state.isMuted = true;
            if (state.audio) {
                state.audio.muted = true;
            }
            set(state);
        },
        unMute() {
            state.isMuted = false;
            if (state.audio) {
                state.audio.muted = false;
            }
            set(state);
        },
        setVolume(volume: number) {
            volume = normalizeVolume(volume);
            state.volume = volume;
            if (state.audio && state.type !== 'none') {
                state.audio.volume = volume * (state.type === 'music' ? state.musicVolume : state.sfxVolume);
            }
            set(state);
        },
        setMusicVolume(volume: number) {
            volume = normalizeVolume(volume);
            if (state.audio && state.type === 'music') {
                state.audio.volume = volume;
            }
            state.musicVolume = volume;
            set(state);
        },
        setSfxVolume(volume: number) {
            volume = normalizeVolume(volume);
            if (state.audio && state.type === 'sfx') {
                state.audio.volume = volume;
            }
            state.sfxVolume = volume;
            set(state);
        },
        preLoadAudio(track: string) {
            if (cachedAudio.has(track)) {
                return;
            }
            const audio = new Audio(`${audioLocation}${track}`);
            audio.preload = 'auto';
            audio.autoplay = false;
            audio.loop = false;
            const audioType = getAudioType(track);
            audio.volume = state.volume * (audioType === 'music' ? state.musicVolume : state.sfxVolume);
            audio.load();
            cachedAudio.set(track, audio);
        },
    };
}

export const audioPlayer = createAudioStore();
