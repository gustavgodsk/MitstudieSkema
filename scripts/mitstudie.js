let CONFIG = {};

const subjects = [];
let current_date = null;

function colorButton(button, color) {
    button.style.background = color;
}

function addEvent(event) {
    const button = event.querySelector("button");
    if (button == null) return;
    const eventTitle = button.querySelector("h4").textContent;
    let subject;
    const existingSubject = subjects.find(
        (node) => node.eventTitle === eventTitle
    );
    if (existingSubject) {
        subject = existingSubject;
    } else {
        const color = getNewColor();
        subject = {
            button,
            eventTitle,
            color
        };
        subjects.push(subject);
    }

    //farvelæg ::before
    const eventType = button
        .querySelector("dl")
        .querySelector(".event__details__item--form-and-group")?.textContent;
    button.classList.add(eventType);

    //forkortelser
    if (CONFIG.forkortelser.enabled && CONFIG.forkortelser.par[eventTitle]) {
        const h4 = button.querySelector("h4");
        h4.textContent = CONFIG.forkortelser.par[eventTitle];
    }

    colorButton(button, subject.color);
}

function getNewColor() {
    for (const [_, color] of Object.entries(CONFIG.colors.events)) {
        // Tjek om farve allerede er brugt
        const isUsed = subjects.some((subject) => subject.color === color);
        if (!isUsed) {
            return color;
        }
    }
    return getRandomColor(); // Fallback: tilfældig farve hvis alle farver er brugt
}

function getRandomColor() {
    const letters = "0123456789ABDCEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

const hide_events = (hide, element = document) => {
    for (const elem of element.querySelectorAll("button")) {
        const classes = [...elem.classList];
        if (
            classes.some(
                (cssClass) => cssClass == "Praktisk" || cssClass == "Vejledning"
            )
        ) {
            elem.parentElement.style.display = hide ? "none" : "";
        }
    }
};
const is_hidden = () => CONFIG.hide_vejledning ?? false;

const add_toggle_input = () => {
    if (document.getElementById("hide_vejledning")) return;

    // tilføj fjern events knap
    const toolbar = document.querySelector(".toolbar__items");
    if (!toolbar) return;

    hide_events_parent = document.createElement("div");
    hide_events_parent.classList.add("button", "button--text");

    checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", "hide_vejledning");
    checkbox.setAttribute("name", "hide_vejledning");
    checkbox.checked = is_hidden();

    checkbox.addEventListener("change", async (el) => {
        const newValue = el.target.checked;

        hide_events(newValue);
        // CONFIG.hide_vejledning = newValue;

        // const storage = await chrome.storage.sync.get("DAT2Config");
        // const config = storage.DAT2Config || {};
        //
        // config.hide_vejledning = newValue;
        // chrome.storage.sync.set({ DAT2Config: config });
        saveDeepSetting("mitstudie.hide_vejledning", newValue);
    });

    label = document.createElement("label");
    label.style.userSelect = "none";
    label.style.marginLeft = "2px";
    label.setAttribute("for", "hide_vejledning");
    label.textContent = "Skjul vejledning";

    hide_events_parent.appendChild(checkbox);
    hide_events_parent.appendChild(label);
    toolbar.insertBefore(hide_events_parent, toolbar.lastElementChild);
};

function callback(mutationList) {
    for (const mutation of mutationList) {
        if (mutation.type !== "childList") return;
        // Ved fetch af data for ny uge
        if (
            mutation.target.classList.contains("timetable__singleday-events") &&
            mutation.addedNodes.length > 0
        ) {
            const event = mutation.addedNodes[0];
            addEvent(event);
            hide_events(is_hidden(), event);
        }
        // Hvis data for ugen allerede er fetched
        else if (
            mutation.target.className === "timetable__week" &&
            mutation.addedNodes.length > 0 &&
            mutation.addedNodes[0].classList.contains(
                "timetable__singleday-events"
            )
        ) {
            const dayEvents = mutation.addedNodes[0].querySelectorAll(".event");
            const hide =
                document.getElementById("hide_vejledning")?.checked || false;
            dayEvents.forEach((element) => {
                addEvent(element);
                hide_events(hide, element);
            });

            colorToday(mutation.target);
        }
        // Ved page load (hele timetable bliver lavet på én gang)
        else if (
            mutation.addedNodes.length > 0 &&
            mutation.addedNodes[0].childNodes.values((node) =>
                node.classList.contains("timetable")
            )
        ) {
            const children = [...mutation.addedNodes[0].childNodes.values()];
            const timetable = children?.filter((node) =>
                node.classList?.contains("timetable")
            )[0];
            const dayEvents = timetable?.querySelectorAll(".event");
            const hide = is_hidden();
            if (dayEvents != null) {
                dayEvents.forEach((event) => {
                    addEvent(event);
                    hide_events(hide, event);
                });
            }
        }

        if (
            mutation.addedNodes.length > 0 &&
            mutation.addedNodes[0].classList?.contains("timetable")
        ) {
            let table = mutation.addedNodes[0];
            colorToday(table);
        } else if (
            mutation.target === "timetable__week" &&
            mutation.addedNodes[0].classList.contains(
                "timetable__singleday-events"
            )
        ) {
            let table = document.querySelectorAll(".timetable__week");
            colorToday(table);
        }

        if (
            mutation.addedNodes.length > 0 &&
            mutation.addedNodes[0].childNodes.values((node) =>
                node.classList.contains("toolbar")
            )
        ) {
            add_toggle_input();
        }
        if (mutation.addedNodes.item(0)?.classList?.contains("event")) {
            const hide =
                document.getElementById("hide_vejledning")?.checked || false;
            hide_events(hide, mutation.addedNodes[0]);
        }
    }
}

let todays_day = null;
function colorToday(days) {
    let all_days = days.querySelectorAll(".timetable__singleday-events");
    let all_titles = days.querySelectorAll(".timetable__day-header");

    const d = new Date();
    let day = d.getDay();

    if (lineElement !== null) {
        lineElement.remove();
        lineElement = null;
    }
    if (day > 0 && day < 6) {
        if (current_date == null) {
            current_date = all_titles[day - 1].textContent;
        }
        if (all_titles[day - 1].textContent == current_date) {
            let todays_day = all_days[day - 1];
            todays_day.style.backgroundColor = CONFIG.colors.current_day_color;
            updateLine(todays_day);
        }
    }
}

let timetableHeight = 0;
let lineElement = null;

function updateLine(today) {
    if (today == null) return;
    timetableHeight = today.clientHeight;
    if (lineElement == null) {
        lineElement = document.createElement("div");
        lineElement.style.setProperty("position", "absolute", "important");
        lineElement.style.height = "5px";
        lineElement.style.width = "100%";
        lineElement.style.zIndex = "9999";
        lineElement.style.backgroundColor = CONFIG.color.line_color;
        lineElement.style.pointerEvents = "none";
        today.style.position = "relative";
        today.appendChild(lineElement);
    }

    const getTopPercentage = calculateTopPercentage();
    lineElement.style.top = getTopPercentage * timetableHeight + "px";
}

function calculateTopPercentage() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (8 < hours < 19) {
        let hour = hours - 8;
        let minutesToHours = minutes / 60;
        let hourPercentage = (hour + minutesToHours) / 11;
        return hourPercentage;
    }
    return 100;
}

const observer = new MutationObserver(callback);

function setupCSS() {
    const style = document.createElement("style");

    const colorRules = Object.entries(CONFIG.colors.event_type)
        .map(
            ([name, color]) =>
                `.${name}::before { background-color: ${color} !important; }`
        )
        .join("\n");

    style.innerHTML =
        colorRules +
        `
    .timetable .event {
        --transparent: none !important;
        --transparent-hover: none !important;
    }
    .timetable .event__details {
        color: var(--color-foreground);
    }
    `;

    document.head.appendChild(style);
}

async function setup() {
    if (!CONFIG.enabled) return;

    const parent = document.querySelector(".app-mitstudie-container");
    observer.observe(parent, {
        childList: true,
        subtree: true
    });

    setupCSS();
}

window.addEventListener("configReady", (e) => {
    CONFIG = e.detail.mitstudie;
    setup();
});

if (window.CONFIG) {
    CONFIG = e.detail.mitstudie;
    setup();
}
