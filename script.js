const subjects = [];
let current_date = null;

function colorButton(button, color){
    button.style.background = color;
}

function addEvent(event){
    const button = event.querySelector("button");
    const eventTitle = button.querySelector("h4").textContent;
    let subject;
    const existingSubject = subjects.find(node => node.eventTitle === eventTitle);
    if (existingSubject){
        subject = existingSubject;
    } else {
        const color = getNewColor();
        subject = {
            button,
            eventTitle,
            color
        }
        subjects.push(subject);
    }

    //farvelæg ::before
    const eventType = button.querySelector("dl")
        .querySelector(".event__details__item--form-and-group")
        .textContent;
    button.classList.add(eventType);

    //forkortelser
    if (config.forkortelser && config.forkortelser.par[eventTitle]){
        const h4 = button.querySelector("h4");
        h4.textContent = config.forkortelser.par[eventTitle];
    }

    colorButton(button, subject.color);
}

function getNewColor() {
    for (const color of config.colors.events) {
        // Tjek om farve allerede er brugt
        const isUsed = subjects.some(subject => subject.color === color);
        if (!isUsed) {
            return color;
        }
    }
    return getRandomColor; // Fallback: tilfældig farve hvis alle farver er brugt
}

function getRandomColor(){
    const letters = "0123456789ABDCEF";
    let color = "#"
    for (let i = 0; i < 6; i++){
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

function callback(mutationList){
    for (const mutation of mutationList) {
        if (mutation.type !== "childList") return;
        // Ved fetch af data for ny uge
        if (mutation.target.classList.contains("timetable__singleday-events")
            && mutation.addedNodes.length > 0){
            const event = mutation.addedNodes[0];
            addEvent(event);
        }
        // Hvis data for ugen allerede er fetched
        else if (mutation.target.className === "timetable__week" 
            && mutation.addedNodes.length > 0 
            && mutation.addedNodes[0].classList.contains("timetable__singleday-events")){
            const dayEvents = mutation.addedNodes[0].querySelectorAll(".event");
                dayEvents.forEach(element => {
                    addEvent(element);
            })

            colorToday(mutation.target);
        }
        // Ved page load (hele timetable bliver lavet på én gang)
        else if (mutation.addedNodes.length > 0
            && mutation.addedNodes[0].classList?.contains("timetable")){
            const dayEvents = mutation.addedNodes[0].querySelectorAll(".event");
            dayEvents.forEach(element => {
                addEvent(element)
            });
        }

        if (mutation.addedNodes.length > 0
            && mutation.addedNodes[0].classList?.contains("timetable")){

            let table = mutation.addedNodes[0];
            colorToday(table);
        }else if (mutation.target === "timetable__week" 
            && mutation.addedNodes[0].classList.contains("timetable__singleday-events")){

            let table = document.querySelectorAll(".timetable__week");
            colorToday(table);
        }
    }
}

function colorToday(days){
    let all_days = days.querySelectorAll('.timetable__singleday-events');
    let all_titles = days.querySelectorAll('.timetable__day-header');

    const d = new Date();
    let day = d.getDay();

    if (day>0 && day<6){
        if (current_date==null){
            current_date=all_titles[day-1].innerHTML;
            console.log(current_date);
        }
        if(all_titles[day-1].innerHTML == current_date){
            let todays_day = all_days[day-1];
            todays_day.style.backgroundColor = config.current_day_color;
        }
    }
}

const observer = new MutationObserver(callback)

function setup(){
    const parent = document.querySelector('.app-mitstudie-container');
    observer.observe(parent, {
        childList: true,
        subtree: true
    });

    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = config.colors.event_type
        .map(el =>
          `.${el.text}::before { background-color: ${el.color} !important; }`)
        .join("\n")
    style.innerHTML += `
    .timetable .event {
        /* fjern grøn ting i hjørner */
        --transparent: none !important;
        --transparent-hover: none !important;
    }
    .timetable .event__details {
        /* gør text helt sort for bedre læsbarhed */
        color: var(--color-foreground);
    }
    `
    document.head.appendChild(style);
}

window.addEventListener('load', () => {
    setup();
})
