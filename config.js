const config = {
    forkortelser: {
        enabled: true, //skift til false hvis du ikke ønsker forkortelser
        par: {
            "Introduktion til matematik og optimering": "IMO",
            "Algoritmer og datastrukturer": "ADS",
            "Introduktion til programmering": "IntProg"
        }
    },
    colors: {
      // imo, ads osv. farver
      events: [
        "#A5BCFF",
        "#FCB9C2",
        "#FDEE95",
      ],
      event_type: [
        { text: 'Forelæsning', color:'red' },
        { text: 'Holdundervisning', color:'orange' },
        { text: 'Praktisk', color:'green' },
      ]
    },
    current_day_color: "#a8b5b0"
    line_color: "#0E79B2cc",
}
