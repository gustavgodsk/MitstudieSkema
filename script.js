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
