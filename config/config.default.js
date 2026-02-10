const DEFAULT_CONFIG = {
    mitstudie: {
        enabled: true,
        hide_vejledning: true,

        forkortelser: {
            enabled: true,
            par: {
                "Introduktion til matematik og optimering": "IMO",
                "Algoritmer og datastrukturer": "ADS",
                "Introduktion til programmering": "IntProg",
                "Computerarkitektur, Netværk og Operativsystemer": "ComArch",
                "Programmeringssprog": "ProgSprog",
                "Beregnelighed og logik": "BerLog"
            }
        },

        colors: {
            current_day_color: "#a8b5b0",
            line_color: "#0E79B2cc",
            events: {
                "1": "#A5BCFF",
                "2": "#FCB9C2",
                "3": "#FDEE95"
            },
            event_type: {
                "Forelæsning": "#FF0000",
                "Holdundervisning": "#FFA500",
                "Praktisk": "#008000"
            }
        }
    },
    panopto: {
        redirect_to_embed: true
    },
    vim_motions: {
        enabled: false,
        keybindings: {
            left: "h",
            down: "j",
            up: "k",
            right: "l",
            history_back: "H",
            history_forward: "L",
            top: "gg",
            bottom: "G",
            reload: "r",
            remove_focus: "<Ctrl-c>"
        }
    }
};
