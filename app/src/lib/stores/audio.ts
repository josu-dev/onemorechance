import type { Readable } from '$lib/stores/types';
import { writable } from 'svelte/store';


const audioLocation = '/audio/';

type ValidTracks = 'music_lobby.mp3' | 'sfx_abucheo.mp3' | 'sfx_aplauso.mp3' | 'sfx_meh.mp3' | 'sfx_round.mp3';

type TrackType = 'music' | 'sfx' | 'none';

type AudioState = {
    type: TrackType;
    track?: ValidTracks;
    audio?: HTMLAudioElement;
    isMuted: boolean;
    isPlaying: boolean;
    isPaused: boolean;
    volume: number;
    musicVolume: number;
    sfxVolume: number;
};

type PlayConfig = {
    loop?: boolean;
    volume?: number;
    duration?: number;
    stopCurrent?: boolean;
    musicVolume?: number;
    sfxVolume?: number;
};

type AudioStore = Readable<AudioState> & {
    play: <T extends ValidTracks>(track: T, config?: PlayConfig) => void;
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


function normalizeVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume));
}

function getTrackType(track: string): TrackType {
    if (track.startsWith('music_')) {
        return 'music';
    }
    if (track.startsWith('sfx_')) {
        return 'sfx';
    }
    return 'none';
}

// function isMusicTrack(track: string): track is MusicTracks {
//     return track.startsWith('music_');
// }

// function isSfxTrack(track: string): track is SfxTracks {
//     return track.startsWith('sfx_');
// }


const cachedAudio = new Map<string, HTMLAudioElement>();


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
        play(track, config) {
            // if (state.isPlaying) {
            //     state.audio!.pause();
            //     state.audio!.currentTime = 0;
            // }
            let audio = cachedAudio.get(track);
            if (!audio) {
                audio = new Audio(`${audioLocation}${track}`);
                cachedAudio.set(track, audio);
            }
            state.type = getTrackType(track);
            state.audio = audio;
            state.isPlaying = true;
            state.isPaused = false;
            audio.volume = state.volume * (state.type === 'music' ? state.musicVolume : state.sfxVolume);
            audio.loop = config?.loop ?? false;
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
            const audioType = getTrackType(track);
            audio.volume = state.volume * (audioType === 'music' ? state.musicVolume : state.sfxVolume);
            audio.load();
            cachedAudio.set(track, audio);
        },
    };
}

export const audioPlayer = createAudioStore();
