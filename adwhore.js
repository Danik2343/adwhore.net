let isReportStage1 = false,
    isReportStage2 = false,
    didWeChangeYouTubeQuestionMark = false,
    isToggle = false,
    isPreviewInside = false,
    isPreviewOutside = false,
    isFirstInputSelect = false,
    isSideActive = false,
    isAdFlagActive = false,
    currentUrl = '',
    currentSkipSource = '',
    currentVideoId = '',
    currentSkip = [],
    skipTimer,
    pathFinder,
    settings,
    keepControlsOpen,
    timestamps = [];

chrome.storage.sync.get(null, function (result) {
    settings = result;
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    chrome.storage.sync.get(null, function (result) {
        settings = result;
    });
});

var countries = ["AI", "AL", "AM", "AQ", "AT", "AU", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BM", "BN", "BO", "BR", "BS", "BT", "BW", "BY", "BZ", "CA", "CD", "CF", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CZ", "DE", "DJ", "DK", "DZ", "EE", "EG", "ER", "ES", "ET", "FI", "FR", "GA", "GB", "GD", "GE", "GH", "GL", "GN", "GR", "GT", "GU", "HK", "HR", "HU", "ID", "IL", "IN", "IS", "IT", "JO", "JP", "KE", "KH", "KI", "KR", "KY", "KZ", "LA", "LR", "LS", "LV", "MK", "MN", "MT", "MU", "NA", "NE", "NG", "NL", "PA", "PH", "PK", "PW", "RO", "RU", "SB", "SC", "SE", "SK", "SL", "SO", "ST", "SV", "SY", "SZ", "TG", "TH", "TL", "TT", "TZ", "UA", "US", "VC", "YE", "ZM"];
var parties = ["SOV", "SOVIET", "UN", "NATO"];

let youtubeMutation = setTimeout(function tick() {
    //console.log("URL check started");
    if (settings && settings["enable"] && document.URL.localeCompare(currentUrl)) {
        currentUrl = document.URL;
        console.log("I'm on youtube and URL has changed");
        if (currentUrl.includes("watch?v=")) {
            console.log("Should be a player somewhere, I'm looking for it");

            v = document.querySelectorAll('video')[0];
            if (v && v.duration) {
                console.log("video found");

                if (!didWeChangeYouTubeQuestionMark) {
                    control = document.createElement("div");
                    control.className = "ytp-right-controls"
                    $(control).insertAfter(document.getElementsByClassName("ytp-right-controls")[0])
                    console.log("creating html");
                    createElemets();
                    console.log("adding layout");
                    addLayout();
                    console.log("ugly css");
                    addStyles();
                    console.log("injecting ADN HTML+CSS into youtube player");
                    inject();
                    console.log("adding JS events");
                    addEvents();
                    console.log("ADN inserted. Let's roll!");
                    didWeChangeYouTubeQuestionMark = true;
                }

                /* RESET AFTER URL CHANGE HERE */
                flagButtonImage.style.padding = "8px 0px";

                isAdFlagActive = document.getElementsByClassName("ytp-button ytp-paid-content-overlay-text")[0].innerText !== "";
                timestamps = [];
                if (typeof (barList) == "object") {
                    if (barList.firstChild) {
                        while (barList.firstChild) {
                            barList.removeChild(barList.firstChild);
                        }
                    }
                }
                if (typeof (barList) == "object") {
                    if (barListPreview.firstChild) {
                        while (barListPreview.firstChild) {
                            barListPreview.removeChild(barListPreview.firstChild);
                        }
                    }
                }
                sideButton.style.display = "none";

                /* GET NEW SEGMENTS */
                flagButtonImage.src = getFlagByCode("unknown");
                pathFinder = {};
                isSideActive = false;
                timestamps = [];
                currentVideoId = getYouTubeID(currentUrl);


                $.ajax({
                    dataType: "json",
                    url: "https://karma.adwhore.net:47976/getVideoData",
                    data: {vID: currentVideoId},
                    success: function (sb) {
                        pathFinder = sb["pathfinder"];
                        pathFinderSide = sb["pathfinder"]["side"];
                        pathFinderCountry = sb["pathfinder"]["country"];
                        flagButtonImage.style.padding = "10px 0px";
                        flagButtonImage.src = getFlagByCode(pathFinderCountry);
                        sideButton.style.display = "block";
                        sideButtonImage.src = getParty(pathFinderSide);
                        isSideActive = true;
                        for (let i = 0; i < sb["data"].length; i++) {
                            sb["data"][i]["source"] = "adn"
                            timestamps.push(sb["data"][i])
                            console.log("insert")
                        }
                    },
                    complete: function () {
                        if (settings["sb"]) {
                            $.ajax({
                                dataType: "json",
                                url: "https://sponsor.ajay.app/api/skipSegments",
                                data: {
                                    videoID: currentVideoId,
                                    category: "sponsor"
                                },
                                success: function (sb) {
                                    for (let i = 0; i < sb.length; i++) {
                                        const item = sb[i];
                                        let isOverflow = false;

                                        let a1 = item["segment"][0]
                                        let a2 = item["segment"][1]
                                        for (let i = 0; i < timestamps.length; i++) {
                                            const it = timestamps[i];
                                            if (it["source"] === "adn") {
                                                let b1 = it["data"]["timestamps"]["start"]
                                                let b2 = it["data"]["timestamps"]["end"]
                                                if (((a1 >= b1) && (a1 <= b2)) || ((a2 >= b1) && (a2 <= b2))) {
                                                    isOverflow = true;
                                                }
                                                if (((b1 >= a1) && (b1 <= a2)) || ((b2 >= a1) && (b2 <= a2))) {
                                                    isOverflow = true;
                                                }
                                            }
                                        }
                                        if (!isOverflow) {
                                            timestamps.push({
                                                "source": "sb",
                                                "data": {
                                                    "timestamps": {
                                                        "start": item["segment"][0],
                                                        "end": item["segment"][1]
                                                    }
                                                }
                                            })
                                        }
                                    }
                                },
                                complete: function () {
                                    timestamps.sort(function (a, b) {
                                        if (a["data"]["timestamps"]["start"] > b["data"]["timestamps"]["start"]) {
                                            return 1;
                                        }
                                        if (a["data"]["timestamps"]["start"] < b["data"]["timestamps"]["start"]) {
                                            return -1;
                                        }
                                        // a должно быть равным b
                                        return 0;
                                    });
                                    console.log(timestamps)
                                    //yt ads walkaround
                                    if (getComputedStyle(document.getElementsByClassName('ytp-play-progress ytp-swatch-background-color')[0], null).backgroundColor === "rgb(255, 0, 0)") {
                                        set(timestamps, v.duration)
                                    } else {
                                        let stoper = document.URL;
                                        let currentDuration = v.duration;
                                        setTimeout(function run() {
                                            if (stoper === document.URL) {
                                                if (v.duration && currentDuration !== v.duration) {
                                                    if (getComputedStyle(document.getElementsByClassName('ytp-play-progress ytp-swatch-background-color')[0], null).backgroundColor === "rgb(255, 0, 0)") {
                                                        set(timestamps, v.duration);
                                                    } else {
                                                        setTimeout(run, 50);
                                                    }
                                                } else {
                                                    setTimeout(run, 100);
                                                }
                                            }
                                        }, 1000);
                                    }
                                }
                            });
                        } else {
                            timestamps.sort(function (a, b) {
                                if (a["data"]["timestamps"]["start"] > b["data"]["timestamps"]["start"]) {
                                    return 1;
                                }
                                if (a["data"]["timestamps"]["start"] < b["data"]["timestamps"]["start"]) {
                                    return -1;
                                }
                                // a должно быть равным b
                                return 0;
                            });
                            console.log(timestamps)
                            //yt ads walkaround
                            if (getComputedStyle(document.getElementsByClassName('ytp-play-progress ytp-swatch-background-color')[0], null).backgroundColor === "rgb(255, 0, 0)") {
                                set(timestamps, v.duration)
                            } else {
                                let stoper = document.URL;
                                let currentDuration = v.duration;
                                setTimeout(function run() {
                                    if (stoper === document.URL) {
                                        if (v.duration && currentDuration !== v.duration) {
                                            if (getComputedStyle(document.getElementsByClassName('ytp-play-progress ytp-swatch-background-color')[0], null).backgroundColor === "rgb(255, 0, 0)") {
                                                set(timestamps, v.duration);
                                            } else {
                                                setTimeout(run, 50);
                                            }
                                        } else {
                                            setTimeout(run, 100);
                                        }
                                    }
                                }, 1000);
                            }
                        }
                    }
                });


            } else {
                currentUrl = "";
                if (v) {
                    console.log("Player was found but there was no duration on it. I'll try again.");
                } else {
                    console.log("Couldn't find a player, will try again and again and again!");
                }
            }
        } else {
            console.log("It seems that we are not on player page. It's temporary, soon we will be able to detect YT videos everywhere");
        }
    }
    youtubeMutation = setTimeout(tick, 250);
}, 0);

function createElemets() {
    mainButton = document.createElement("div");
    mainButtonImage = document.createElement("img");

    markInButton = document.createElement("div");
    markInImage2 = document.createElement("img");

    markOutButton = document.createElement("div");
    markOutImage2 = document.createElement("img");

    replayButton = document.createElement("div");
    replayButtonImage = document.createElement("img");

    flagButton = document.createElement("div");
    flagButtonImage = document.createElement("img");

    sideButton = document.createElement("div");
    sideButtonImage = document.createElement("img");

    awesomeTooltip = document.createElement("div");

    barList = document.createElement('ul');
    barListPreview = document.createElement('ul');

    adplayer = document.createElement("div");
    adskip = document.createElement("div");
    adSkipButton = document.createElement("div");

    adspan = document.createElement("span");

    adButton1 = document.createElement("button");
    skipImage1 = document.createElement("img");

    adButton2 = document.createElement("button");
    skipImage2 = document.createElement("img");

    adButton3 = document.createElement("button");
    skipImage3 = document.createElement("img");

    adButton4 = document.createElement("button");
    skipImage4 = document.createElement("img");

    _adSkip = document.createElement("div");
    _adSkipButton = document.createElement("div");
    _adSpan = document.createElement("span");
    _adButton1 = document.createElement("button");
    _skipImage1 = document.createElement("img");
    _adButton2 = document.createElement("button");
    _skipImage2 = document.createElement("img");

    awesomeTooltipBody = document.createElement("div");
    awesomeTooltipBodyText = document.createElement("div");
    segControls = document.createElement("div");
    segControlsNumberLabel = document.createElement("span");
    segControlsNumberInput = document.createElement("select");

    option1 = document.createElement("option");
    option2 = document.createElement("option");
    option3 = document.createElement("option");
    option4 = document.createElement("option");
    option5 = document.createElement("option");
    option6 = document.createElement("option");
    option7 = document.createElement("option");
    option8 = document.createElement("option");
    option9 = document.createElement("option");
    option10 = document.createElement("option");
    option11 = document.createElement("option");
    option12 = document.createElement("option");

    mark1 = document.createElement("div");
    mark1.id = "mark1";

    mark2 = document.createElement("div");
    mark2.id = "mark2";

    mark3 = document.createElement("div");
    mark3.id = "mark3";

    mark4 = document.createElement("div");
    mark4.id = "mark4";

    mark5 = document.createElement("div");
    mark5.id = "mark5";

    mark6 = document.createElement("div");
    mark6.id = "mark6";

    option01 = document.createElement("input");
    option02 = document.createElement("input");
    option03 = document.createElement("input");

    option01.style.width = "15px"
    option01.style.height = "15px"

    option02.style.width = "15px"
    option02.style.height = "15px"

    option01b = document.createElement("p");
    option01b.textContent = "🤡";

    option02b = document.createElement("p");
    option02b.textContent = "🎭";

    option03b = document.createElement("p");
    option03b.textContent = "💰";

    option01.name = "option01";
    option01.value = "a1";
    option01.type = "checkbox";

    option02.name = "option02";
    option02.value = "a2";
    option02.type = "checkbox";

    option03.name = "option03";
    option03.value = "a3";
    option03.type = "checkbox";
    option03.checked = true

    previewInside = document.createElement("div");
    previewOutside = document.createElement("div");

    markInImage = document.createElement("img");
    markOutImage = document.createElement("img");

    markInImage1 = document.createElement("img");
    markOutImage1 = document.createElement("img");

    segStartInput = document.createElement("input");
    segEndInput = document.createElement("input");

    uploadButton = document.createElement("div");
    uploadButtonImage = document.createElement("img");
}

function addLayout() {
    mainButton.appendChild(mainButtonImage);
    markInButton.appendChild(markInImage2);
    markOutButton.appendChild(markOutImage2);

    control.appendChild(replayButton);
    replayButton.appendChild(replayButtonImage);


    if (settings["show_flags"]) {
        control.appendChild(flagButton);
        flagButton.appendChild(flagButtonImage);
        control.appendChild(sideButton);
        sideButton.appendChild(sideButtonImage);
    }


    adplayer.appendChild(adskip);
    adskip.appendChild(adSkipButton);
    adSkipButton.appendChild(adspan);

    adspan.appendChild(adButton1);
    adButton1.appendChild(skipImage1);
    adspan.appendChild(adButton2);
    adButton2.appendChild(skipImage2);
    adspan.appendChild(adButton3);
    adButton3.appendChild(skipImage3);
    adspan.appendChild(adButton4);
    adButton4.appendChild(skipImage4);

    adplayer.appendChild(_adSkip);
    _adSkip.appendChild(_adSkipButton);
    _adSkipButton.appendChild(_adSpan);
    _adSpan.appendChild(_adButton1);
    _adButton1.appendChild(_skipImage1);
    _adSpan.appendChild(_adButton2);
    _adButton2.appendChild(_skipImage2);

    awesomeTooltip.appendChild(awesomeTooltipBody);
    awesomeTooltipBody.appendChild(awesomeTooltipBodyText);

    replayButton.appendChild(segControls);
    segControls.appendChild(segControlsNumberLabel);

    segControlsNumberInput.appendChild(option1);
    segControlsNumberInput.appendChild(option2);
    segControlsNumberInput.appendChild(option3);
    segControlsNumberInput.appendChild(option4);
    segControlsNumberInput.appendChild(option5);
    segControlsNumberInput.appendChild(option6);
    segControlsNumberInput.appendChild(option7);
    segControlsNumberInput.appendChild(option8);
    segControlsNumberInput.appendChild(option9);
    segControlsNumberInput.appendChild(option10);
    segControlsNumberInput.appendChild(option11);
    segControlsNumberInput.appendChild(option12);

    segControls.appendChild(segControlsNumberInput);

    segControls.appendChild(mark1);
    segControls.appendChild(mark2);

    segControls.appendChild(mark3);
    segControls.appendChild(mark4);

    segControls.appendChild(mark5);
    segControls.appendChild(mark6);

    mark1.appendChild(option01b);

    mark2.appendChild(option01);

    mark3.appendChild(option02b);

    mark4.appendChild(option02)

    mark5.appendChild(option03b);

    mark6.appendChild(option03)

    segControls.appendChild(markInButton);

    previewInside.appendChild(markInImage);
    previewInside.appendChild(markOutImage);
    segControls.appendChild(previewInside);

    segControls.appendChild(previewOutside);
    previewOutside.appendChild(markInImage1);
    previewOutside.appendChild(markOutImage1);
    segControls.appendChild(segStartInput);

    segControls.appendChild(mainButton);
    segControls.appendChild(segEndInput);
    segControls.appendChild(markOutButton);
    segControls.appendChild(uploadButton);
    uploadButton.appendChild(uploadButtonImage);
}


// TODO: transform to .css
function addStyles() {
    mainButton.id = "toggleButton";
    mainButton.setAttribute("role", "button");
    mainButton.style.height = "100%";
    mainButton.style.display = "none";
    mainButton.style.float = "right";
    mainButton.style.marginRight = "0px";
    mainButton.style.cursor = "pointer";

    mainButtonImage.style.boxSizing = "border-box";
    mainButtonImage.style.height = "100%";
    mainButtonImage.style.filter = "invert(89%)";
    mainButtonImage.style.float = "right";
    mainButtonImage.style.padding = "2px 2px";
    mainButtonImage.src = getIconPath("toggle-on.svg");

    markInButton.id = "markInButton";
    markInButton.setAttribute("role", "button");
    markInButton.style.height = "100%";
    markInButton.style.display = "none";
    markInButton.style.float = "right";
    markInButton.style.marginRight = "3px";
    markInButton.style.cursor = "pointer";

    markInImage2.style.boxSizing = "border-box";
    markInImage2.style.height = "100%";
    markInImage2.style.filter = "invert(89%)";
    markInImage2.style.float = "right";
    markInImage2.style.padding = "4px 0";
    markInImage2.src = getIconPath("mark-out.svg");

    markOutButton.id = "markOutButton";
    markOutButton.setAttribute("role", "button");
    markOutButton.style.height = "100%";
    markOutButton.style.display = "none";
    markOutButton.style.float = "right";
    markOutButton.style.marginRight = "20px";
    markOutButton.style.cursor = "pointer";

    markOutImage2.style.boxSizing = "border-box";
    markOutImage2.style.height = "100%";
    markOutImage2.style.filter = "invert(89%)";
    markOutImage2.style.float = "right";
    markOutImage2.style.padding = "4px 0";
    markOutImage2.src = getIconPath("mark-in.svg");

    replayButton.id = "replayButton";
    replayButton.setAttribute("role", "button");
    replayButton.style.height = "100%";
    replayButton.style.float = "right";
    replayButton.style.marginRight = "8px";
    replayButton.style.cursor = "pointer";

    replayButtonImage.style.boxSizing = "border-box";
    replayButtonImage.style.height = "100%";
    replayButtonImage.style.filter = "invert(89%)";
    replayButtonImage.style.float = "right";
    replayButtonImage.style.padding = "8px 0px";
    replayButtonImage.src = getIconPath("report-button.svg");

    flagButton.id = "flagButton";
    flagButton.setAttribute("role", "button");
    flagButton.style.height = "100%";
    flagButton.style.float = "right";
    flagButton.style.marginRight = "12px";
    flagButton.style.cursor = "pointer";

    flagButtonImage.style.boxSizing = "border-box";
    flagButtonImage.style.height = "100%";
    flagButtonImage.style.border = "1";
    flagButtonImage.style.float = "right";
    flagButtonImage.style.padding = "8px 0px";
    flagButtonImage.src = getFlagByCode("unknown");

    sideButton.id = "sideButton";
    sideButton.setAttribute("role", "button");
    sideButton.style.height = "100%";
    sideButton.style.float = "right";
    sideButton.style.display = "none";
    sideButton.style.marginRight = "12px";
    //sideButton.style.marginTop = "1px";
    sideButton.style.cursor = "pointer";

    sideButtonImage.style.boxSizing = "border-box";
    sideButtonImage.style.height = "100%";
    sideButtonImage.style.border = "2";
    sideButtonImage.style.float = "right";
    sideButtonImage.style.padding = "10px 0";
    sideButtonImage.src = getFlagByCode("SOV.svg");

    awesomeTooltip.id = "replayButtonTooltip";
    awesomeTooltip.className = "ytp-tooltip";
    awesomeTooltip.style.display = "none";

    barList.style.height = 0;
    barList.style.margin = 0;
    barList.style.padding = 0;

    barList.style.position = "absolute";
    barList.style.width = "100%";
    barList.style.width = "visible";
    barList.style.paddingTop = "1px";

    barListPreview.style.height = 0;
    barListPreview.style.margin = 0;
    barListPreview.style.padding = 0;
    barListPreview.style.position = "absolute";
    barListPreview.style.width = "100%";
    barListPreview.style.width = "visible";
    barListPreview.style.paddingTop = "5px";

    adplayer.className = "ytp-ad-player-overlay-skip-or-preview";

    adskip.className = "ytp-ad-skip-ad-slot";
    adskip.style.display = "none";

    adSkipButton.className = "ytp-ad-skip-button-slot";

    adspan.className = "ytp-ad-skip-button-container";

    adButton1.className = "ytp-ad-skip-button ytp-button";

    skipImage1.style.boxSizing = "border-box";
    skipImage1.style.height = "30px";
    skipImage1.style.filter = "invert(89%)";
    skipImage1.style.transform = "";
    skipImage1.style.float = "right";
    skipImage1.style.padding = "4px 0";
    skipImage1.src = getIconPath("backward.svg");

    adButton2.className = "ytp-ad-skip-button ytp-button";

    skipImage2.style.boxSizing = "border-box";
    skipImage2.style.height = "30px";
    skipImage2.style.filter = "invert(89%)";
    skipImage2.style.float = "right";
    skipImage2.style.padding = "4px 0";
    skipImage2.src = getIconPath("like.svg");

    adButton3.className = "ytp-ad-skip-button ytp-button";

    skipImage3.style.boxSizing = "border-box";
    skipImage3.style.height = "30px";
    skipImage3.style.filter = "invert(89%)";
    skipImage3.style.float = "right";
    skipImage3.style.padding = "4px 0";
    skipImage3.src = getIconPath("dislike.svg");


    adButton4.className = "ytp-ad-skip-button ytp-button";

    skipImage4.style.boxSizing = "border-box";
    skipImage4.style.height = "30px";
    skipImage4.style.filter = "invert(89%)";
    skipImage4.style.float = "right";
    skipImage4.style.padding = "4px 0";
    skipImage4.src = getIconPath("close-button.svg");

    _adSkip.className = "ytp-ad-skip-ad-slot";

    _adSkip.style.display = "none";

    _adSkipButton.className = "ytp-ad-skip-button-slot";

    _adSpan.className = "ytp-ad-skip-button-container";

    _adButton1.className = "ytp-ad-skip-button ytp-button";

    _skipImage1.style.boxSizing = "border-box";
    _skipImage1.style.height = "30px";
    _skipImage1.style.transform = "";
    _skipImage1.style.float = "right";
    _skipImage1.style.padding = "4px 0";
    _skipImage1.src = getIconPath("LogoSponsorBlock256px.png");

    _adButton2.className = "ytp-ad-skip-button ytp-button";

    _skipImage2.style.boxSizing = "border-box";
    _skipImage2.style.height = "30px";
    _skipImage2.style.filter = "invert(89%)";
    _skipImage2.style.float = "right";
    _skipImage2.style.padding = "4px 0";
    _skipImage2.src = getIconPath("forward.svg");

    awesomeTooltipBody.className = "ytp-tooltip-body";
    awesomeTooltipBody.style.left = "-22.5px";
    awesomeTooltipBody.style.padding = "5px 8px";
    awesomeTooltipBody.style.backgroundColor = "rgba(26,26,26,0.8)";
    awesomeTooltipBody.style.borderRadius = "2px";

    awesomeTooltipBodyText.className = "ytp-text-tooltip";
    awesomeTooltipBodyText.textContent = "Repeat";

    segControls.style.display = "none";
    segControls.style.height = "100%";
    segControls.style.float = "right";
    segControls.style.alignItems = "center";
    segControls.style.opacity = "1";

    segControlsNumberLabel.style.margin = "0 3px 0 10px";
    segControlsNumberLabel.style.paddingTop = "2px";
    segControlsNumberLabel.style.fontSize = "12px";

    segControlsNumberInput.name = "reportType";
    segControlsNumberInput.style.display = "none";
    segControlsNumberInput.style.marginRight = "10px";
    segControlsNumberInput.style.width = "40px";
    segControlsNumberInput.style.height = "25px";

    /*
    0. SSL: реклама аферистов, букмекеров, казино, пирамид, инвестиций
    1. Предзаписанная рекламная вставка, не озвученная блогером
    2. Предзаписанная рекламная вставка, озвученная блогером
    3. Оригинальная вставка, записанная блогером
    4. Блогер получил продукт и делает на него обзор
    5. Реклама других каналов с несхожей тематикой
    6. Реклама других каналов со схожей тематикой
    7. Реклама другого блогера, который снимается в ролике (коллаборация)
    8. Реклама своих проектов, соц. сетей, каналов.
    9. Оригинальная реклама, которую интересно смотреть
    10. Я не могу описать что это было, но мне показалось, что это реклама
     */

    option1.value = "Select";
    option1.selected = true;
    option1.disabled = true;
    option1.hidden = true;

    option1.text = "❓❓❓";
    option2.value = "0";
    option2.text = chrome.i18n.getMessage("category0Text");
    option2.title = chrome.i18n.getMessage("category0Title");
    option3.value = "1";
    option3.text = chrome.i18n.getMessage("category1Text");
    option3.title = chrome.i18n.getMessage("category1Title");
    option4.value = "2";
    option4.text = chrome.i18n.getMessage("category2Text");
    option5.value = "3";
    option5.text = chrome.i18n.getMessage("category3Text");
    option5.title = chrome.i18n.getMessage("category3Title");
    option6.value = "4";
    option6.text = chrome.i18n.getMessage("category4Text");
    option6.title = chrome.i18n.getMessage("category4Title");
    option7.value = "5";
    option7.text = chrome.i18n.getMessage("category5Text");
    option7.title = chrome.i18n.getMessage("category5Title");
    option8.value = "6";
    option8.text = chrome.i18n.getMessage("category6Text");
    option8.title = chrome.i18n.getMessage("category6Title");
    option9.value = "7";
    option9.text = chrome.i18n.getMessage("category7Text");
    option9.title = chrome.i18n.getMessage("category7Title");
    option10.value = "8";
    option10.text = chrome.i18n.getMessage("category8Text");
    option11.title = chrome.i18n.getMessage("category8Title");
    option11.value = "9";
    option11.text = chrome.i18n.getMessage("category9Text");
    option11.title = chrome.i18n.getMessage("category9Title");
    option12.value = "10";
    option12.text = chrome.i18n.getMessage("category10Text");
    option12.title = chrome.i18n.getMessage("category10Title");

    previewInside.id = "inside";
    previewInside.setAttribute("role", "button");
    previewInside.style.height = "100%";
    previewInside.style.display = "none";
    previewInside.style.float = "right";
    previewInside.style.marginRight = "10px";
    previewInside.style.cursor = "pointer";

    markInImage.style.boxSizing = "border-box";
    markInImage.style.height = "100%";
    markInImage.style.filter = "invert(89%)";
    markInImage.style.float = "right";
    markInImage.style.padding = "4px 0";
    markInImage.src = getIconPath("mark-out.svg");

    markOutImage.style.boxSizing = "border-box";
    markOutImage.style.height = "100%";
    markOutImage.style.filter = "invert(88%)";
    markOutImage.style.float = "right";
    markOutImage.style.padding = "4px 0";
    markOutImage.src = getIconPath("mark-in.svg");

    previewOutside.id = "outside";
    previewOutside.setAttribute("role", "button");
    previewOutside.style.height = "100%";
    previewOutside.style.display = "none";
    previewOutside.style.float = "right";
    previewOutside.style.marginRight = "10px";
    previewOutside.style.cursor = "pointer";

    markInImage1.style.boxSizing = "border-box";
    markInImage1.style.height = "100%";
    markInImage1.style.filter = "invert(89%)";
    markInImage1.style.float = "right";
    markInImage1.style.padding = "4px 0";
    markInImage1.src = getIconPath("mark-in.svg");

    markOutImage1.style.boxSizing = "border-box";
    markOutImage1.style.height = "100%";
    markOutImage1.style.filter = "invert(88%)";
    markOutImage1.style.float = "right";
    markOutImage1.style.padding = "4px 0";
    markOutImage1.src = getIconPath("mark-out.svg");

    segStartInput.id = "replayStart";
    segStartInput.type = "number";
    segStartInput.min = "0";
    segStartInput.max = v.duration - 1;
    segStartInput.step = "0.01"
    segStartInput.style.marginRight = "0px";
    segStartInput.style.borderRadius = "2px";
    segStartInput.style.display = "none";
    segStartInput.style.width = "60px";
    segStartInput.style.height = "26px";

    segEndInput.id = "replayEnd";
    segEndInput.type = "number";
    segEndInput.min = "1";
    segEndInput.max = v.duration;
    segEndInput.step = "0.01"
    segEndInput.style.marginRight = "3px";
    segEndInput.style.width = "60px";
    segEndInput.style.borderRadius = "2px";
    segEndInput.style.height = "26px";

    uploadButton.id = "uploadButton";
    uploadButton.setAttribute("role", "button");
    uploadButton.style.height = "100%";
    uploadButton.style.display = "none";
    uploadButton.style.float = "right";
    uploadButton.style.marginRight = "10px";
    uploadButton.style.cursor = "pointer";

    uploadButtonImage.style.boxSizing = "border-box";
    uploadButtonImage.style.height = "100%";
    uploadButtonImage.style.filter = "invert(89%)";
    uploadButtonImage.style.float = "right";
    uploadButtonImage.style.padding = "8px 0";
    uploadButtonImage.src = getIconPath("cloud-upload.svg");

    option01b.style.fontSize = "150%";

    option02b.style.fontSize = "150%";

    mark2.style.paddingTop = "4px";
    mark4.style.paddingTop = "4px";

    mark6.style.marginRight = "8px";
    mark6.style.paddingTop = "4px";
    option03b.style.fontSize = "150%";

}

function inject() {
    document.getElementsByClassName("ytp-chrome-controls")[0].insertBefore(awesomeTooltip, document.getElementsByClassName(" ytp-right-controls")[0])
    document.getElementsByClassName("ytp-progress-bar-container")[0].insertAdjacentElement("afterbegin", barList);
    document.getElementsByClassName("ytp-progress-bar-container")[0].insertAdjacentElement("afterbegin", barListPreview);
    document.getElementsByClassName("html5-video-player")[0].appendChild(adplayer);
}

function addEvents() {
    flagButton.addEventListener("click", function () {
        window.open("https://adwhore.net", '_blank');
    });

    mainButton.addEventListener("click", function () {
        isToggle = !isToggle;
        if (isToggle) {
            mainButtonImage.style.transform = "rotate(180deg)";
            v.currentTime = segStartInput.value;
            v.pause();
        } else {
            mainButtonImage.style.transform = "";
            v.currentTime = segEndInput.value;
            v.pause();
        }
    });

    markInButton.addEventListener("click", function () {
        v.currentTime = segStartInput.value;
        v.play();
    });

    markOutButton.addEventListener("click", function () {
        v.currentTime = segEndInput.value;
        v.play();
    });

    sideButton.addEventListener("click", function () {
        window.open("https://adwhore.net/stats", '_blank');
    });

    v.addEventListener('seeking', (event) => {
        if ((isReportStage1) && (!isReportStage2)) {
            if (isToggle) {
                if (v.currentTime < segEndInput.value) {
                    segStartInput.value = +v.currentTime.toFixed(2);
                }
            } else {
                if (v.currentTime > segStartInput.value) {
                    segEndInput.value = +v.currentTime.toFixed(2);
                }
            }
            set_preview();
        }
    });


    v.addEventListener("timeupdate", function () {
        if ((!isReportStage1) && (!isReportStage2)) {
            if (timestamps.length > 0) {
                for (var i = 0; i < timestamps.length; i++) {
                    if ((this.currentTime >= timestamps[i]["data"]["timestamps"]["start"]) && (this.currentTime <= timestamps[i]["data"]["timestamps"]["start"] + 0.8)) {
                        if (timestamps[i]["source"] === "adn") {
                            let whatshouldido = whatShouldIDo(timestamps[i]);
                            console.log(whatshouldido)
                            if (whatshouldido) {
                                whatshouldido = 2
                            } else {
                                whatshouldido = 1
                            }
                            if (whatshouldido === 2) {
                                currentSkipSource = "adn";
                                currentSkip = [timestamps[i]["data"]["timestamps"]["start"], timestamps[i]["data"]["timestamps"]["end"], timestamps[i]["id"]]
                                addSegmentSkip(currentSkip)
                                v.currentTime = timestamps[i]["data"]["timestamps"]["end"] + 0.1;
                                adplayer.style.display = "block";
                                adskip.style.display = "block";
                                adButton3.style.display = "";
                                clearTimeout(skipTimer);
                                skipTimer = setTimeout(function () {
                                    adplayer.style.display = "none";
                                    adskip.style.display = "none";
                                }, 8000);
                            } else if (whatshouldido === 1) {
                                currentSkipSource = "adn";
                                currentSkip = [timestamps[i]["data"]["timestamps"]["start"], timestamps[i]["data"]["timestamps"]["end"], timestamps[i]["id"]]

                                adplayer.style.display = "block";
                                _adSkip.style.display = "block";
                                adButton3.style.display = "";
                                _skipImage1.src = getIconPath("128.png");
                                skipImage2.src = getIconPath("like.svg");
                                skipImage1.style.transform = "rotate(180deg)";
                                clearTimeout(skipTimer);
                                skipTimer = setTimeout(function () {
                                    adplayer.style.display = "none";
                                    _adSkip.style.display = "none";
                                }, 6000);
                            } else {
                                //nothing
                            }
                        } else {
                            currentSkipSource = "sb";
                            currentSkip = [timestamps[i]["data"]["timestamps"]["start"], timestamps[i]["data"]["timestamps"]["end"]]
                            adplayer.style.display = "block";
                            _adSkip.style.display = "block";
                            _skipImage1.src = getIconPath("LogoSponsorBlock256px.png");
                            clearTimeout(skipTimer);

                            skipTimer = setTimeout(function () {
                                adplayer.style.display = "none";
                                _adSkip.style.display = "none";
                            }, 6000);
                        }
                    }
                }
            }
        } else {
            if (isPreviewInside) {
                if (this.currentTime >= segEndInput.value) {
                    v.pause();
                    isPreviewInside = false;
                }
            }
            if (isPreviewOutside) {

                if (v.currentTime >= segStartInput.value) {
                    v.currentTime = segEndInput.value;
                    isPreviewOutside = false;
                }
            }
        }
    });

    adButton1.addEventListener("click", function () {
        if (skipImage1.style.transform === "") {
            v.currentTime = currentSkip[0] + 1;
            skipImage1.style.transform = "rotate(180deg)";
            v.play();
        } else {
            v.currentTime = currentSkip[1];
            skipImage1.style.transform = "";
            v.play();
        }
    });


    adButton2.addEventListener("click", function () {
        if (currentSkipSource === "adn") {
            skipImage2.src = getIconPath("heart.svg");
            $.ajax({
                dataType: "json",
                type: "POST",
                url: "https://karma.adwhore.net:47976/addSegmentLike",
                data: JSON.stringify({sID: currentSkip[2], secret: settings["secret"]}),
                success: function (sb) {
                    // alert(`Success. Reason: ${JSON.stringify(sb)}`);
                }
            });
            setTimeout(function () {
                adskip.style.display = "none"
                skipImage2.src = getIconPath("like.svg");
            }, 1000);
        } else {
            segStartInput.value = +(currentSkip[0]).toFixed(2);
            segEndInput.value = +(currentSkip[1]).toFixed(2);

            segStartInput.style.width = (+v.duration.toFixed(2).length * 6 + 22) + "px";
            segEndInput.style.width = (+v.duration.toFixed(2).length * 6 + 22) + "px";

            uploadButton.style.display = "block";
            flagButton.style.display = "none";
            sideButton.style.display = "none";

            segControlsNumberInput.style.display = "none";
            segStartInput.style.display = "block";
            segEndInput.style.display = "block";
            previewInside.style.display = "none";
            previewOutside.style.display = "none";

            mark1.style.display = "none";
            mark2.style.display = "none";
            mark3.style.display = "none";
            mark4.style.display = "none";
            mark5.style.display = "none";
            mark6.style.display = "none";

            markInButton.style.display = "block";
            markOutButton.style.display = "block";
            mainButton.style.display = "block";
            isToggle = false;
            segControlsNumberInput.value = "Select";

            replayButtonImage.src = getIconPath("close-button.svg");
            segControls.style.display = "flex";

            isFirstInputSelect = true;

            set_preview();

            replayButtonImage.src = getIconPath("back.svg");

            isFirstInputSelect = true;

            segControlsNumberInput.style.display = "block";
            uploadButton.style.display = "block";
            flagButton.style.display = "none";
            sideButton.style.display = "none";

            segStartInput.style.display = "none";
            segEndInput.style.display = "none";
            previewInside.style.display = "block";
            previewOutside.style.display = "block";
            mark1.style.display = "block";
            mark2.style.display = "block";
            mark3.style.display = "block";
            mark4.style.display = "block";

            mark5.style.display = "block";
            mark6.style.display = "block";

            segControlsNumberInput.value = "Select";
            markInButton.style.display = "none";
            mainButton.style.display = "none";
            markOutButton.style.display = "none";
            isReportStage2 = true;
            isReportStage1 = true;

            v.pause();
        }
    });

    adButton3.addEventListener("click", function () {
        let age = prompt(`Report on ${currentVideoId} skip ${currentSkip}\n\nWhat's wrong?`);

        $.ajax({
            dataType: "json",
            type: "POST",
            url: "https://karma.adwhore.net:47976/addSegmentReport",
            data: JSON.stringify({sID: currentSkip[2], text: age, secret: settings["secret"]}),
            success: function (sb) {
                alert(`Success. Reason: ${JSON.stringify(sb)}`);
            }
        });
        v.currentTime = currentSkip[0] + 1;
        adskip.style.display = "none"
    });

    adButton4.addEventListener("click", function () {
        adskip.style.display = "none"
        adButton3.style.display = "";
        skipImage2.src = getIconPath("like.svg");
        clearTimeout(skipTimer);
    });

    _adButton2.addEventListener("click", function () {
        if (currentSkipSource === "adn") {
            skipImage2.src = getIconPath("like.svg");
            skipImage1.style.transform = "";
            v.currentTime = currentSkip[1] + 0.1;
            addSegmentSkip(currentSkip)

            adButton3.style.display = ""

            adskip.style.display = "block";
            _adSkip.style.display = "none";

            skipTimer = setTimeout(function () {
                adskip.style.display = "none";
            }, 8000);
        } else {
            adButton3.style.display = "none"
            skipImage2.src = getIconPath("cloud-upload.svg");
            skipImage1.style.transform = "";
            v.currentTime = currentSkip[1] + 0.1;
            adskip.style.display = "block";
            _adSkip.style.display = "none";
            skipTimer = setTimeout(function () {
                adskip.style.display = "none";
                adButton3.style.display = "";
                skipImage2.src = getIconPath("like.svg");
            }, 5000);
        }
    });

    previewInside.addEventListener("click", function () {
        isPreviewOutside = false;
        isPreviewInside = true;
        v.currentTime = segStartInput.value;
        v.play();
    });

    previewOutside.addEventListener("click", function () {
        isPreviewInside = false;
        isPreviewOutside = true;
        v.currentTime = segStartInput.value - 1;
        v.play();
    });

    segStartInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 32) {
            if (v.paused) {  // если видео остановлено, запускаем
                v.play();
            } else {
                v.pause();
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 13) {
            if (v.currentTime < segEndInput.value) {
                segStartInput.value = +(parseFloat(v.currentTime)).toFixed(2);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 40) {
            if (segStartInput.value < parseFloat(segEndInput.value) - 0.1) {
                segStartInput.value = +(parseFloat(segStartInput.value) - 0.1).toFixed(2);
                v.currentTime = +parseFloat(segStartInput.value);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 38) {
            if (segStartInput.value < parseFloat(segEndInput.value) + 0.1) {
                segStartInput.value = +(parseFloat(segStartInput.value) + 0.1).toFixed(2);
                v.currentTime = +parseFloat(segStartInput.value);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 37) {

            if (segStartInput.value < parseFloat(segEndInput.value) - 2) {
                segStartInput.value = +(parseFloat(segStartInput.value) - 2).toFixed(2);
                v.currentTime = +parseFloat(segStartInput.value);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 39) {
            if (segStartInput.value < parseFloat(segEndInput.value) + 2) {
                segStartInput.value = +(parseFloat(segStartInput.value) + 2).toFixed(2);
                v.currentTime = +parseFloat(segStartInput.value);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    segStartInput.addEventListener('change', (event) => {
        v.currentTime = segStartInput.value;
    });

    segStartInput.addEventListener('click', (event) => {
        if (!isToggle) {
            isToggle = true;
            isFirstInputSelect = false;
            v.currentTime = segStartInput.value;
            v.pause();
            mainButtonImage.style.transform = "rotate(180deg)";
        }
    });

    segEndInput.addEventListener('change', (event) => {
        v.currentTime = segEndInput.value;
    });

    segEndInput.addEventListener('click', (event) => {
        if (isToggle || isFirstInputSelect) {
            isFirstInputSelect = false;
            isToggle = false;
            v.currentTime = segEndInput.value;
            v.pause();
            mainButtonImage.style.transform = "";
        }
    });

    segEndInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 32) {
            if (v.paused) {  // если видео остановлено, запускаем
                v.play();
            } else {
                v.pause();
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 13) {
            if (v.currentTime > +parseFloat(segStartInput.value)) {
                segEndInput.value = +v.currentTime.toFixed(2);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 40) {
            if (segEndInput.value > +parseFloat(segStartInput.value) - 0.1) {
                segEndInput.value = +(parseFloat(segEndInput.value) - 0.1).toFixed(2);
                v.currentTime = +parseFloat(segEndInput.value);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 38) {
            if (segEndInput.value > +parseFloat(segStartInput.value) + 0.1) {
                segEndInput.value = +(parseFloat(segEndInput.value) + 0.1).toFixed(2);
                v.currentTime = +parseFloat(segEndInput.value);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 37) {
            if (segEndInput.value > parseFloat(segStartInput.value) - 2) {
                segEndInput.value = +(parseFloat(segEndInput.value) - 2).toFixed(2);
                v.currentTime = +parseFloat(segEndInput.value);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else if (e.keyCode === 39) {
            if (segEndInput.value > parseFloat(segStartInput.value) + 2) {
                segEndInput.value = +(parseFloat(segEndInput.value) + 2).toFixed(2);
                v.currentTime = +parseFloat(segEndInput.value);
            }
            e.preventDefault();
            e.stopPropagation();
            return true;
        } else {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    replayButtonImage.addEventListener("mouseover", function () {
        if (isReportStage1) {
            awesomeTooltipBodyText.textContent = chrome.i18n.getMessage("close");
        } else if (isReportStage2) {
            awesomeTooltipBodyText.textContent = chrome.i18n.getMessage("edit");
        } else {
            awesomeTooltipBodyText.textContent = chrome.i18n.getMessage("addsegment");
        }
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (replayButtonImage.offsetLeft + (replayButtonImage.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    replayButtonImage.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    sideButtonImage.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.textContent = getSideTooltip()
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (sideButtonImage.offsetLeft + (sideButtonImage.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    sideButtonImage.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    flagButtonImage.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.textContent = getFlagTooltip();
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (flagButtonImage.offsetLeft + (flagButtonImage.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    flagButtonImage.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    uploadButton.addEventListener("mouseover", function () {
        if (isReportStage2) {
            awesomeTooltipBodyText.textContent = chrome.i18n.getMessage("send");
        } else {
            awesomeTooltipBodyText.textContent = chrome.i18n.getMessage("checkBeforeSend");
        }

        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (uploadButtonImage.offsetLeft + (uploadButtonImage.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    uploadButton.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    markInButton.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.textContent = chrome.i18n.getMessage("markIn");
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (markInImage2.offsetLeft + (markInImage2.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    markInButton.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    markOutButton.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.textContent = chrome.i18n.getMessage("markOut");
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (markOutImage2.offsetLeft + (markOutImage2.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    markOutButton.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    previewInside.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.textContent = chrome.i18n.getMessage("previewInside");
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (previewInside.offsetLeft + (previewInside.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    previewInside.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    previewOutside.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.textContent = chrome.i18n.getMessage("previewOutside");
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (previewOutside.offsetLeft + (previewOutside.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    previewOutside.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    segControlsNumberInput.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.innerHTML = chrome.i18n.getMessage("selectCategory");
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (segControlsNumberInput.offsetLeft + (segControlsNumberInput.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    segControlsNumberInput.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });


    segControlsNumberInput.onchange = function () {
        option03.checked = !(segControlsNumberInput.value === "7" || segControlsNumberInput.value === "8");
    }


    mark1.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.innerHTML = chrome.i18n.getMessage("checkOne");
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (mark1.offsetLeft + (mark1.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    mark1.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    mark3.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.innerHTML = chrome.i18n.getMessage("checkTwo");
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (mark3.offsetLeft + (mark3.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    mark3.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    mark5.addEventListener("mouseover", function () {
        awesomeTooltipBodyText.innerHTML = chrome.i18n.getMessage("checkThree");
        awesomeTooltip.style.bottom = (control.parentElement.offsetHeight + (awesomeTooltip.offsetHeight / 2) + 10) + "px";
        awesomeTooltip.style.left = (mark5.offsetLeft + (mark5.offsetWidth / 2) - (awesomeTooltip.offsetWidth / 2) - 12) + "px";
        awesomeTooltip.style.display = "block";
    });

    mark5.addEventListener("mouseleave", function () {
        awesomeTooltip.style.display = "none";
    });

    uploadButton.addEventListener("click", function () {
        isReportStage2 = !isReportStage2;
        if (isReportStage2) {
            replayButtonImage.src = getIconPath("back.svg");

            isFirstInputSelect = true;

            segControlsNumberInput.style.display = "block";
            uploadButton.style.display = "block";
            flagButton.style.display = "none";
            sideButton.style.display = "none";

            segStartInput.style.display = "none";
            segEndInput.style.display = "none";
            previewInside.style.display = "block";
            previewOutside.style.display = "block";
            mark1.style.display = "block";
            mark2.style.display = "block";
            mark3.style.display = "block";
            mark4.style.display = "block";

            mark5.style.display = "block";
            mark6.style.display = "block";

            segControlsNumberInput.value = "Select";
            markInButton.style.display = "none";
            mainButton.style.display = "none";
            markOutButton.style.display = "none";
        } else {
            if (segControlsNumberInput.value !== "Select") {
                let comment = prompt(chrome.i18n.getMessage("pleaseEnterComment"));
                let json = {
                    "vID": currentVideoId,
                    "secret": settings["secret"],
                    "category": segControlsNumberInput.value,
                    "start": +segStartInput.value,
                    "end": +segEndInput.value,
                    "pizdabol": option02.checked,
                    "honest": option02.checked,

                    "paid": option03.checked,
                    "comment": comment
                };

                $.ajax
                ({
                    url: "https://karma.adwhore.net:47976/addSegment",
                    type: "POST",
                    data: JSON.stringify(json),
                    contentType: 'application/json',
                    async: false,
                    success: function (data) {
                        alert("Success\n" + JSON.stringify(data));
                    },
                    error: function (s, status, error) {
                        alert('error\n' + JSON.stringify(s.responseJSON) + '\n' + status + '\n' + error);
                    }
                })

            } else {
                isReportStage2 = !isReportStage2;
                alert(chrome.i18n.getMessage("categoryMissing"));
            }
        }
    });

    adskip.addEventListener("mouseover", function () {
        clearTimeout(skipTimer);
    });
    adskip.addEventListener("mouseleave", function () {
        clearTimeout(skipTimer);
        skipTimer = setTimeout(() => adskip.style.display = "none", 3000);
    });

    _adSkip.addEventListener("mouseover", function () {
        clearTimeout(skipTimer);
    });
    _adSkip.addEventListener("mouseleave", function () {
        clearTimeout(skipTimer);
        skipTimer = setTimeout(() => _adSkip.style.display = "none", 3000);
    });

    replayButtonImage.addEventListener("click", function () {
        if (isReportStage2) {
            uploadButton.style.display = "block";
            flagButton.style.display = "none";
            sideButton.style.display = "none";

            segControlsNumberInput.style.display = "none";
            segStartInput.style.display = "block";
            segEndInput.style.display = "block";
            previewInside.style.display = "none";
            previewOutside.style.display = "none";
            mark1.style.display = "none";
            mark2.style.display = "none";
            mark3.style.display = "none";
            mark4.style.display = "none";
            mark5.style.display = "none";
            mark6.style.display = "none";

            markInButton.style.display = "block";
            markOutButton.style.display = "block";
            mainButton.style.display = "block";
            replayButtonImage.src = getIconPath("close-button.svg");
            isReportStage2 = false;
        } else {
            isReportStage1 = !isReportStage1;
            if (isReportStage1) {

                const ytplayer = document.querySelector('.html5-video-player')
                const progressbar = ytplayer.querySelector('.ytp-play-progress')
                const loadbar = ytplayer.querySelector('.ytp-load-progress')

                function updateProgressBar() {
                    progressbar.style.transform = 'scaleX(' + (v.currentTime / v.duration) + ')'
                    $('.ytp-time-current').text(formatTime(v.currentTime))
                }

                function updateBufferProgress() {
                    loadbar.style.transform = 'scaleX(' + (v.buffered.end(v.buffered.length - 1) / v.duration) + ')'
                }

                v.addEventListener('timeupdate', updateProgressBar)
                v.addEventListener('progress', updateBufferProgress)

                keepControlsOpen = setInterval(function () {
                    $('.html5-video-player').removeClass('ytp-autohide')
                }, 100)


                segStartInput.value = +v.currentTime.toFixed(2);

                segEndInput.value = +(v.currentTime + 40).toFixed(2);

                if (+segEndInput.value >= v.duration) {
                    segEndInput.value = +(v.duration).toFixed(2) - 0.5;
                }

                segStartInput.style.width = (+v.duration.toFixed(2).length * 6 + 22) + "px";
                segEndInput.style.width = (+v.duration.toFixed(2).length * 6 + 22) + "px";

                uploadButton.style.display = "block";
                flagButton.style.display = "none";
                sideButton.style.display = "none";

                segControlsNumberInput.style.display = "none";
                segStartInput.style.display = "block";
                segEndInput.style.display = "block";
                previewInside.style.display = "none";
                previewOutside.style.display = "none";

                mark1.style.display = "none";
                mark2.style.display = "none";
                mark3.style.display = "none";
                mark4.style.display = "none";
                mark5.style.display = "none";
                mark6.style.display = "none";

                markInButton.style.display = "block";
                markOutButton.style.display = "block";
                mainButton.style.display = "block";
                isToggle = false;
                segControlsNumberInput.value = "Select";

                replayButtonImage.src = getIconPath("close-button.svg");
                segControls.style.display = "flex";

                isFirstInputSelect = true;


                set_preview();
            } else {
                clearInterval(keepControlsOpen)
                v.removeEventListener('timeupdate', updateProgressBar)
                v.removeEventListener('progress', updateBufferProgress)

                uploadButton.style.display = "none";
                flagButton.style.display = "block";
                if (isSideActive) {
                    sideButton.style.display = "block";
                }

                while (barListPreview.firstChild) {
                    barListPreview.removeChild(barListPreview.firstChild);
                }

                segControlsNumberInput.style.display = "none";
                segStartInput.style.display = "none";
                segEndInput.style.display = "none";
                previewInside.style.display = "none";
                previewOutside.style.display = "none";

                mark1.style.display = "none";
                mark2.style.display = "none";

                mark3.style.display = "none";
                mark4.style.display = "none";
                mark5.style.display = "none";
                mark6.style.display = "none";

                mainButton.style.display = "none";
                markInButton.style.display = "none";
                markOutButton.style.display = "none";

                uploadButton.style.display = "none";
                segEndInput.style.display = "none";
                replayButtonImage.src = getIconPath("report-button.svg");
                segControls.style.display = "none";
            }
        }
    });
}

function getYouTubeID(url) {
    var ID = '';
    url = url.replace(/([><])/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    } else {
        ID = url;
    }
    return ID;
}

function createBar() {
    let bar = document.createElement('li');
    bar.style.display = "inline-block";
    bar.style.height = "3px";
    bar.innerText = '\u00A0';
    return bar;
}

function addBarToList(a, b, color, opacity, duration) {
    let width = (b - a) / duration * 100;
    width = Math.floor(width * 100) / 100;
    let bar = createBar();
    bar.style.backgroundColor = color;
    bar.style.opacity = opacity;
    bar.style.width = width + '%';
    barList.insertAdjacentElement('beforeEnd', bar);
}

function getBarColor(segment) {
    if (segment["source"] === "sb") {
        return "#00FF00"
    } else if (segment["source"] === "adn") {
        if (segment["paid"] === 0) {
            return "#00fcd3"
        } else if (segment["acrate"] * 100 < settings["accept"]) {
            return "#0000ff"
        } else {
            return "#ff6100"
        }
    }
}

function getBarOpacity(segment) {
    if (segment["source"] === "sb") {
        return "1.0"
    } else if (segment["source"] === "adn") {
        if (segment["paid"] === 0) {
            return "1.0"
        } else if (segment["trust"] * 100 < settings["trust"]) {
            return "1.0"
        } else {
            return "1.0"
        }
    }
}


function set(segs, duration) {
    while (barList.firstChild) {
        barList.removeChild(barList.firstChild);
    }

    if (!segs || !duration || segs.length === 0) {
        console.log("incorrect args")
        return;
    }

    //console.log(segs);
    duration = Math.floor(duration);
    addBarToList(0, segs[0]["data"]["timestamps"]["start"], "#FFFFFF", "0.0", duration);

    for (var i = 0; i < segs.length; i++) {

        addBarToList(segs[i]["data"]["timestamps"]["start"], segs[i]["data"]["timestamps"]["end"], getBarColor(segs[i]), getBarOpacity(segs[i]), v.duration)

        if ((i + 1) < segs.length) {
            addBarToList(segs[i]["data"]["timestamps"]["end"], segs[i + 1]["data"]["timestamps"]["start"], "#00FF00", "0.0", v.duration)
        }
    }
}


function set_preview() {
    while (barListPreview.firstChild) {
        barListPreview.removeChild(barListPreview.firstChild);
    }

    duration = Math.floor(v.duration);
    var width = 0;

    var preview_seg = [0];

    preview_seg[1] = segStartInput.value;
    preview_seg[2] = segEndInput.value;


    for (var i = 0; i < preview_seg.length; i++) {
        width = (preview_seg[i + 1] - preview_seg[i]) / duration * 100;
        width = Math.floor(width * 100) / 100;
        let bar = createBar();

        if (i % 2 === 1) {
            bar.style.backgroundColor = "#FFFF00";
            bar.style.opacity = "1.0";
        } else {
            bar.style.backgroundColor = "#FFFF00";
            bar.style.opacity = "0.0";
        }

        bar.style.height = "2.5px";
        bar.style.width = width + '%';

        barListPreview.insertAdjacentElement('beforeEnd', bar);
    }
}

function getIconPath(path) {
    return chrome.extension.getURL('/img/' + path)
}

function getFlagByCode(code) {
    if (countries.includes(code)) {
        return chrome.extension.getURL('/img/flags/' + code + '.svg')
    } else {
        return chrome.extension.getURL('/img/flags/_flag.svg')
    }
}

function getParty(partyName) {
    if (parties.includes(partyName)) {
        return chrome.extension.getURL('/img/parties/' + partyName + '.svg')
    } else {
        return chrome.extension.getURL('/img/parties/_flag.svg')
    }
}

function getFlagTooltip() {
    if (pathFinder["side"]) {
        return chrome.i18n.getMessage("countryStatsWIP");
    } else {
        return chrome.i18n.getMessage("404")
    }
}

function getSideTooltip() {
    let unixTimestamp = +pathFinder["timestamp"]
    let milliseconds = unixTimestamp * 1000 // 1575909015000
    let dateObject = new Date(milliseconds)
    let humanDateFormat = dateObject.toLocaleString()

    if (pathFinder["side"] === "UN") {
        return chrome.i18n.getMessage("UN_pathfinder_prefix") + pathFinder["name"] + chrome.i18n.getMessage("pathfinder_from") + pathFinder["country"] + chrome.i18n.getMessage("UN_date") + humanDateFormat + chrome.i18n.getMessage("clickToViewColdWarStats");
    } else if (pathFinder["side"] === "NATO") {
        return chrome.i18n.getMessage("NATO_pathfinder_prefix") + pathFinder["name"] + chrome.i18n.getMessage("pathfinder_from") + pathFinder["country"] + chrome.i18n.getMessage("NATO_date") + humanDateFormat + chrome.i18n.getMessage("clickToViewColdWarStats");
    } else if (pathFinder["side"] === "SOVIET") {
        return chrome.i18n.getMessage("SOV_pathfinder_prefix") + pathFinder["name"] + chrome.i18n.getMessage("pathfinder_from") + pathFinder["country"] + chrome.i18n.getMessage("SOV_date") + humanDateFormat + chrome.i18n.getMessage("clickToViewColdWarStats");
    }
}

function whatShouldIDo(segment) {
    if (segment["paid"] === 0) {
        if (isAdFlagActive) {
            if (segment["moderated"] || (segment["trust"] * 100 > settings["trust"])) {
                return +settings["love"]["y2"]
            } else {
                return +false
            }
        } else {
            if (segment["moderated"] || (segment["trust"] * 100 > settings["trust"])) {
                return +settings["love"]["y1"]
            } else {
                return +false
            }
        }
    } else if (segment["acrate"] * 100 < settings["accept"]) {
        if (isAdFlagActive) {
            if (segment["moderated"] || (segment["trust"] * 100 > settings["trust"])) {
                return +settings["hate"]["y2"]
            } else {
                return +false
            }
        } else {
            if (segment["moderated"] || (segment["trust"] * 100 > settings["trust"])) {
                return +settings["hate"]["y1"]
            } else {
                return +false
            }
        }
    } else {
        if (isAdFlagActive) {
            if (segment["moderated"] || (segment["trust"] * 100 > settings["trust"])) {
                return +settings["fine"]["y2"]
            } else {
                return +false
            }
        } else {
            if (segment["moderated"] || (segment["trust"] * 100 > settings["trust"])) {
                return +settings["fine"]["y1"]
            } else {
                return +false
            }
        }
    }
}

function addSegmentSkip(segment) {
    $.ajax({
        dataType: "json",
        type: "POST",
        url: "https://karma.adwhore.net:47976/addSegmentSkip",
        data: JSON.stringify({sID: segment[2], secret: settings["secret"]}),
        success: function (sb) {
            //alert(`Success. Reason: ${sb}`);
        }
    });
}


function formatTime(time) {
    time = Math.round(time)

    const minutes = Math.floor(time / 60)
    let seconds = time - minutes * 60

    seconds = seconds < 10 ? '0' + seconds : seconds

    return minutes + ':' + seconds
}