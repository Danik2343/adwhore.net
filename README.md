<p align="center">
<a href="https://adwhore.net"><img src="https://i.imgur.com/siqpaEu.png" alt="logo" width="300"></img></a> </br>
better youtube for everyone</br>
<b>alpha</b>
</p>

# ADWHORE.NET
**ADN** is an open source browser extension designed to **rid YouTube of corrupt ads** and **support honest YouTubers**.  
<p align="center">
<img src="https://i.imgur.com/LyEw8OZ.png" alt="ads in progress bar" width="500"></img></br>
<b>in action</b>
</p>

**ADN**'s available for [Firefox](https://addons.mozilla.org/ru/firefox/addon/adwhore-net/).  
There is a pending extension for Chrome Web Store and Opera.  
I'm also trying to win a fight with Apple support to publish extension for Safari.

## How does it work?
**Users report ads in videos, select its category and honesty, moderate each other's reports and compete.  
When you watch a video that our agents have already studied, all ad inserts will be marked in it so you can skip if you want to.**
<p align="center">
<img src="https://i.imgur.com/oBqAp8E.png" alt="report ad" width="500"></img></br>
<b>ADN has a cool start & end selector</b>
</p>

The **acceptance level** is being calculated for each ad.  
It depends on a blogger's previous behaviour and current ad category.  

It will be higher if blogger is honest with his audience and doesn't advertise questionable products.  
But if ADN determines that blogger sells his audience trust... he will become an adwhore and will be treated accordingly!  

If acceptance level is below of set by you, ad will be skipped automatically.

By default, the acceptance level is 70% and ads are skipped only if YouTuber didn't stated that there is a ad integration in his video.  
You can adjust settings however you want.

**ADWHORE.NET** uses advanced reputation system to fight vandalism:  
* Server calculates trust index for each ad so it will be autoskipped only if there is enough trust (set by you).
* People with high reputation acts as moderators without even knowing about it.  
* If system detects vandalism, all user contributions and impact on other users will be eliminated using [StalinSort](https://github.com/gustavo-depaula/stalin-sort)-like algorithm.
* Admin team checks segments from time to time to reward people with reputation so they can moderate each other.

## More screenshots
<p align="center">
<img src="https://i.imgur.com/RfkQTWd.png" alt="report ad" width="500"></img></br>
<b>We use category to determine if ad is acceptable.</b></br></br>
<img src="https://i.imgur.com/C2OshAA.png" alt="report ad" width="500"></img></br>
<b>Skip ad with a simple click and automatically.</b></br></br>
<img src="https://i.imgur.com/uDAAwnr.png" alt="report ad" width="500"></img></br>
<b>Become the pathfinder. Be the hero!</br>Cool stats will arrive later!</b></br>
</p>

## Data stored
tl;dr bare minimum, no tails
* Hashed + salted IP address. We can still identify and disable all your contributions but no one can get IP from salted hash and identify you. 
* We also store your country and city code assigned to hashed + salted IP.
* All information you submit (like, report, skip, upload).
* Time of contribution.
* Your secret key generated by the server when you first time downloaded extension (used for every POST request).
* Nickname associated to secret key which can be changed by you.

## Requests
* Every time you browse YouTube video ADN makes a GET request to get all known commercial segments from video.
    * These requests are not logged.
* Every time you skip YouTube commercial segment a POST request is sent to provide leaderboards functionality.
* Every time you like YouTube commercial segment a POST request is sent to provide moderation functionality.
* Every time you report YouTube commercial segment a POST request is sent to provide moderation functionality.
* Every time you upload YouTube commercial segment a POST request is sent to provide service for everyone


## Contributing
* Become active community member. Submit commercial segments and review others. It's easy and fun.
* I wrote extension with 0 JS knowledge, so I really need someone to review it.
* I really need someone to fix my bad english in this markdown doc.
* I also need someone to port it on iOS/android when ADN will come out of alpha.
* I search for 100k+ subscribers YouTube ambassadors worldwide.
* Your ideas and thoughts are welcome.

## History
I came up with this idea on 23rd May 2020 when I occasionally saw a video with drunk Russian YouTuber complaining about health of the platform.  

Almost all Russian YouTubers make money through stealth advertising of questionable products (aka shit).  
YouTube doesn't pay good money in Russia so bloggers literally sell people's trust for small money not caring for reputation.  
But there are also good creative guys, not very much of them.  

So when this guy tries to recommend something just for fun - he's always getting blamed for it because of his colleagues.  

I was looking for new project, so I decided to create a solution for this problem: to create a way to differ honest YouTubers from adwhores.  

At first, I wanted to create a socialblade-like website where people could report such bad YouTubers so moderators can review ads and calculate trust level: if blogger can be trusted for words he say. Main goal: highlight good guys in pile of shit. So I wanted to create a support extension to show this "trust level" near YT channel name.  
With time this idea evolved to fully functional adblocker with a goal to separate good guys from bad, blame bad guys with proofs, to force bad guys be better. I really hope that you understood what I was trying to express :D

So I experimented with collaborative pet-projects on my SA:MP scripts users (1k active users per day) and finally started ADN development.

22 July 2020 is a start for active development, 4 August 2020 - alpha release date.

## Differences from SponsorBlock
[SponsorBlock](https://github.com/ajayyy/SponsorBlock) is a most active similar project that was lucky to appear before ADN.  
* ADN provide optional support for fetching segments from SponsorBlock's database.  

It's more stable and has an active community, but it doesn't care if ad is acceptable or not: it just blocks it.  

I disagree with such aproach, so I didn't stop ADN development when discovered SB project and never will.  

ADN's project goal is to keep balance between a commercial dump and club of altruists: think of it like of Middle Way.  

ADN main focus is Russian speaking youtube, 2nd priority is English speaking community. When ADN's reputation system and client will come out of beta, ADN will support every major language.

> It's also important to mention that while both ADN and SB client's are OSS, SB also provides source for server and keeps it's simple database open.  
ADN keeps server side code closed to prevent vandalism and don't share database to prevent it from being illegally reselled by SMM agencies.  
SB API's unlimited. ADN's API is limited and intended only for building clients for other platforms.

In case of maintainer's death/inactivity: server code and db will be  [uploaded here](https://github.com/qrlk/am-i-dead)

## Similar project
TODO: mention projects before sb like segmentsbar etc

## Credit
ADN provide optional support for [SponsorBlock API](https://github.com/ajayyy/SponsorBlock/wiki/API-Docs)  
TODO: add icons references
