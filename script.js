const subjects = [];
let current_date = null;

function colorButton(button, color){
    button.style.background = color;
}

function addEvent(event){
    //remove praktisk event if enabled in config
    if (config.remove_praktisk){
        if (event.querySelectorAll(".event__details__item--form-and-group")[0].textContent === "Praktisk"){
            event.style.setProperty("display", "none", "important");
        }
    }
    const button = event.querySelector("button");
    if (button == null) return;
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

const hide_events = (match, hide, element=document) => {
    for (const elem of element.querySelectorAll(`.${match}`)) {
        elem.parentElement.style.display = hide? "none" : ""
    }
}
const is_hidden = () => (localStorage.getItem("hide_praktisk") || false) === "true"

const add_toggle_input = ()  => {
    if (document.getElementById("hide_praktisk")) { return }
    // tilføj fjern events knap
    const toolbar = document.querySelector(".toolbar__items")
    if (!toolbar) { return }
    hide_events_parent = document.createElement("div")
    hide_events_parent.classList.add("button", "button--text")

    checkbox = document.createElement("input")
    checkbox.setAttribute("type", "checkbox")
    checkbox.setAttribute("id", "hide_praktisk")
    checkbox.setAttribute("name", "hide_praktisk")
    checkbox.checked = is_hidden()
    checkbox.addEventListener("change", (el) => {
        localStorage.setItem("hide_praktisk", el.explicitOriginalTarget.checked);
        hide_events("Praktisk", el.explicitOriginalTarget.checked)
    });

    label = document.createElement("label")
    label.setAttribute("for", "hide_praktisk")
    label.innerHTML = "Skjul praktisk"

    hide_events_parent.appendChild(checkbox)
    hide_events_parent.appendChild(label)
    toolbar.insertBefore(hide_events_parent, toolbar.lastElementChild)
}

function callback(mutationList){
    for (const mutation of mutationList) {
        if (mutation.type !== "childList") return;
        // Ved fetch af data for ny uge
        if (mutation.target.classList.contains("timetable__singleday-events")
            && mutation.addedNodes.length > 0){
            const event = mutation.addedNodes[0];
            addEvent(event);
            hide_events("Praktisk", is_hidden(), event)
        }
        // Hvis data for ugen allerede er fetched
        else if (mutation.target.className === "timetable__week"
            && mutation.addedNodes.length > 0
            && mutation.addedNodes[0].classList.contains("timetable__singleday-events")){
            const dayEvents = mutation.addedNodes[0].querySelectorAll(".event");
            const hide = document.getElementById("hide_praktisk")?.checked || false
                dayEvents.forEach(element => {
                    addEvent(element);
                    hide_events("Praktisk", hide, element)
            })

            colorToday(mutation.target);
        }
        // Ved page load (hele timetable bliver lavet på én gang)
        else if (mutation.addedNodes.length > 0
            && mutation.addedNodes[0].classList?.contains("timetable")){
            const dayEvents = mutation.addedNodes[0].querySelectorAll(".event");
            const hide = is_hidden()
            dayEvents.forEach(element => {
                addEvent(element)
                hide_events("Praktisk", hide, element)
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

        if (mutation.addedNodes.length > 0
            && mutation.addedNodes[0].classList?.contains("toolbar")) {
            add_toggle_input()
        }
        if (mutation.addedNodes.item(0)?.classList?.contains("event")) {
            const hide = document.getElementById("hide_praktisk")?.checked || false
            hide_events("Praktisk", hide, mutation.addedNodes[0])
        }
    }
}

let todays_day = null;
function colorToday(days){
    let all_days = days.querySelectorAll('.timetable__singleday-events');
    let all_titles = days.querySelectorAll('.timetable__day-header');

    const d = new Date();
    let day = d.getDay();

    if (lineElement !== null){
        lineElement.remove();
        lineElement = null;
    }
    if (day>0 && day<6){
        if (current_date==null){
            current_date=all_titles[day-1].innerHTML;
        }
        if(all_titles[day-1].innerHTML == current_date){
            let todays_day = all_days[day-1];
            todays_day.style.backgroundColor = config.current_day_color;
            updateLine(todays_day)
        }
    }
    
}

let timetableHeight = 0;
let lineElement = null;

function updateLine(today){
    if (today == null) return;
    timetableHeight = today.clientHeight;
    if (lineElement == null){
        lineElement = document.createElement("div");
        lineElement.style.setProperty("position", "absolute", "important");
        lineElement.style.height = "5px";
        lineElement.style.width = "100%";
        lineElement.style.zIndex = "9999";
        lineElement.style.backgroundColor = config.line_color;
        lineElement.style.pointerEvents = "none";
        today.style.position = "relative";
        today.appendChild(lineElement);
    }

    //const getTopPercentage = calculateTopPercentage();
    const getTopPercentage = 0.5;
    lineElement.style.top = getTopPercentage * timetableHeight + "px";

}

function calculateTopPercentage(){
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (8 < hours < 19){
        let hour = hours - 8;
        let minutesToHours = minutes / 60;
        let hourPercentage = (hour + minutesToHours) / 11;
        return hourPercentage;
    }
    return 100;
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
