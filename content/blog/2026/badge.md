---
template: "blog_post.html"
title: "Bigger, better, faster: Introducing the Nix Badge 2.0"
authors: ["Morgan Jones", "the Nix Vegas #badgelife team"]
description: "Four days in Vegas. Two NixOS installs. One SD card."
date: "2026-08-28"
---

<video class="video-loop" width="100%" autoplay muted loop>
  <source src="https://relive.nix.vegas/share/video/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/9b6fcf04-9b25-4133-9e2a-2953fabfa123" type="video/mp4" />
</video>

We decided to do a very hard thing for Hacker Summer Camp this year. At the
height of component shortages, we built a whole single board computer and
shipped it by DEF CON.

It was bigger than last year's badge by about an inch on the diagonal. It was
better, with ethernet, HDMI, real SDIO, real USB, and a dedicated debugging
bridge. And it was faster, running parallel NixOS installs on either an ARM or
RISC-V core from the same SD card. Yep, it booted Linux.

We're very proud of this labor of love for the Nix community, and were excited
to share it with our speakers at Nix Vegas, and now you.

----

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/d59ba100-27ef-4738-81cc-36643be9e06e/preview)

> The Nix Vegas #badgelife team

----

## Links

- [PCB](https://git.nixos.lv/NixVegas/pcb)
- [BadgeOS](https://git.nixos.lv/NixVegas/BadgeOS)

----

We have heard very strong feedback that people want these. We have some v2.0 hardware
badges left, but need to figure out how to sequence another run (v2.1, likely
with some hardware tweaks). We'll see about launching on [CrowdSupply](https://www.crowdsupply.com) soon
as they closely fit our values as an open source project; stay tuned.

This blogpost has a companion [talk at NixCon this year](https://talks.nixcon.org/nixcon-2026/talk/LN8PXG/),
maybe we'll have more information by then.

If you think this is cool and want to sponsor us, reach out at <sponsor@nix.vegas> or see our [sponsorship prospectus](/2026/sponsor).

----

# defcon: 33 -> 34

Our badge at [DEF CON 33](https://defcon.org/html/defcon-33/dc-33-index.html) was based on the [ESP32-C6](https://www.espressif.com/en/products/socs/esp32-c6).
It had 12 LEDs, and ran on 3xAAA batteries. Since it was our first time making a DEF CON badge and all of
our first year running the Nix Community, we decided to keep it relatively
simple. Of course, we added a bunch of features to it too, and
[implemented](/blog/2025/2025-retrospective/#and-then-the-feature-creep-happened) the Nix store's HTTP binary cache protocol as a bonus.

We wanted _more_ for [DEF CON 34](https://defcon.org/html/defcon-34/dc-34-index.html), though.
We still loved the idea of badges running a binary
cache, but quad SPI to the SD card on the ESP32-C6 was not a recipe for
anything resembling speed. We even tried it. With an interposer to fix [our
broken SD pinout](/blog/2025/2025-retrospective/#reproduce-this-build),
serving NARs over wifi was extremely slow. Not exactly sustainable for a cache.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/c250a83b-cd3b-4c81-a0ea-6c301ff99049/preview)

> Modern problems, modern solutions, etc.

And, since we accidentally ordered a ton of AA batteries for our badge last year
due to an Amazon misclick, the badge this year needed to use them _somehow_.

# Playing SoM Roulette

We experimented with a few options. A system-on-module was probably easier to
get working for a badge than a system-on-chip and discrete DRAM, so we leaned
that direction first. On the SoM side, we picked up a dev board for the [Milk-V
Duo Module 01](https://milkv.io/duo-module-01) and looked at the [Waveshare
ESP32 P4](https://www.waveshare.com/wiki/ESP32-P4-Module) because it also had
high-speed SDIO and ethernet. On the SoC side, we managed to get our hands on
what was likely the last
[OrangeCrab](https://1bitsquared.com/products/OrangeCrab) available so we could
play with a Lattice ECP5.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/758c05f7-8570-48b9-b1c5-0726104371f3/preview)

> A Milk-V Duo Module 01 dev board, ready for action

While the ECP5 is a formidable chip (and the [Cam Link
4K](https://www.elgato.com/us/en/p/cam-link-4k) we used to run our stream and
talk recordings [is actually based on
one](https://schlarp.com/posts/everything-i-own-owned/#elgato-cam-link-4k-video-capture)),
Lattice does not include a hardware DRAM controller, so you are stuck
implementing DRAM training and signaling yourself in Verilog or your wrapper of
choice. You also have to route some flavor of DDR, which is expensive,
time-consuming, and error-prone (though newer tooling is [making it less
so](https://x.com/seveibar/status/2092077446497702165)). It would also add more
layers to the badge unless we did a small daughterboard (effectively, making
our own SoM). These strongly looked like "next year" items for us.

We ultimately decided to go with the Milk-V Duo Module 01 despite the supply
chain being a potential issue. We knew it worked, we knew it could boot NixOS
from experimenting with it, and the Waveshare P4 happened to have roughly the
same 88-pin footprint within a couple millimeters (either convergent evolution,
or one company copied the other).

Given the choice between spending a ton of time routing a SoM that could boot
NixOS on a badge and one that couldn't, the choice was clear. The theme of DEF
CON this year was [Agency](https://defcon.org/html/defcon-34/dc-34-theme.html),
and we had to just go for it. The only thing that's more "agency" than dual
booting ARM and RISC-V would be putting a full FPGA on the badge or doing
custom silicon [like Bunnie
did](https://www.wired.com/story/defcon-34-badge-baochip-andrew-bunnie-huang/),
and we didn't want to bite that off this year.

# Reproduce This Build

We had our [reproducible build pipeline](https://git.nixos.lv/NixVegas/pcb) and
KiCad project from last year, so started there. We were sponsored by PCBWay
rather than using JLCPCB this year, so had to make a few *very minor* changes
to the output format. The two fab shops use the exact same Gerber format, so
[Fabrication Toolkit](https://github.com/bennymeg/Fabrication-Toolkit) worked
just fine as it did last year.

PCBWay also allows slightly tighter routing tolerances, so after a few DRC
modifications, things mostly just worked. After breaking our build process into
multiple derivations, we recompressed our Gerber output using 7zip [solid
mode](https://en.wikipedia.org/wiki/Solid_compression), since PCBWay has a 100
MiB file limit but accepts 7zip, and this allowed us to meet it. 

# AI is actually useful

Restoring sanity to PCB design and embedded development is one of the most
important things I've seen AI tools be able to do. If you're reading this and
thinking "oh no, this badge is going to be a bunch of slop..."
no, it was mostly designed by hand. But... some of the most convincing
arguments I've seen for why it's useful have to do with component datasheets
and reverse engineering hardware.

Using a skill to fuzzy search [LCSC](https://www.lcsc.com/), download _and
translate_ datasheets, and spit out KiCad components and schematics with
[easyeda2kicad](https://search.nixos.org/packages?channel=unstable&query=easyeda2kicad)
(also in nixpkgs) was amazing, full stop. At the very least,
it allowed me to do things like ask what buck-boost converters were common,
what their supply was on LCSC, and then do things like converting that into an
approximate schematic that I could then manually refine, place, and route,
along with a first pass at device tree nodes. It also helped search, translate,
and interpret 300 page CPU datasheets when I do not speak Chinese. Simply put,
the LLM can fill in the gaps you have in your knowledge if you work with it.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/01bfffa1-ca72-4eab-8533-ea31de5a8091/preview)

> Fable did a self portrait as an [octopus escaping a jar](https://www.youtube.com/watch?v=_w-sZ-iDe1c) (but it was our SoM, and we got mask ROMs)

Frontier models that can preflight check PCBs for errors are massively
underrated. Fable found multiple subtle mistakes, including a couple major
schematic issues (the data lines on our SD card were swapped around, for
example). This is the exact kind of thing that's really error prone if you're
doing it by hand, but a robot that can use KiCad's Python API to dump netlists
will identify the error quite quickly.

Parts substitution is also exactly the thing a LLM is good at. PCBWay gives you
an Excel file full of your components and whether they have them, and the
estimated lead time. Throwing it at Fable and a LCSC search tool will
immediately help to repopulate it with confirmations, corrections, or
redirections. It can then apply these back to your repo so you simply do not
have to do so by hand.

And, nixpkgs offers [140K+ tools](https://search.nixos.org/packages), which is perfect
for an agent driving long processes.

# Embedded development is fun again

Researching upstream trees of various [Debian sources](https://github.com/scpcom/sophgo-sg200x-debian) was also quite useful.
If you use the LLM as a research assistant alongside normal grep, you can identify
how certain configs and modules are defined in context of kernel sources
and strange Debian-style polyrepo setups, which informs what you may be missing when porting NixOS.
You can kick these processes off, go do something else, and come back with a report
(in somewhat tortured English) of the [load-bearing](https://louisabraham.github.io/load-bearing/) things that it found.
While some things may be hallucinated, you can go and prove or disprove those claims on your own,
but you at least have a starting point.

The iteration process with hardware is often trial and error anyway, with unreliable
documentation and legacy code everywhere. Sometimes, knowing what doesn't work is
just as informative, and trying it fast is the difference between having a badge at
DEF CON and not having one.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/2e85ca33-677c-4605-88aa-c251cecf0d1c/preview)

> Automatic iteration on hardware bringup FTW

These are all processes that are ordinarily more time-consuming than they could
be, and the best usecases for AI! When all you have are PDFs and a LLM that can
wield `nix run nixpkgs#poppler-utils` and knows other languages better than
you, it is likely wise to offload things that are effectively hard labor to it
so you can focus on the things it cannot do. For me, this was routing,
silkscreen, and the features of the badge itself. Search, error checking, and
some aspects of component selection were squarely in the LLM's wheelhouse, as
was helping to try things with the hardware.

The agent's box was a [Protectli VP2420](https://protectli.com/product/vp2420/) connected
over our 802.11s [mesh network](https://git.nixos.lv/NixVegas/systems/src/branch/main/mesh.nix#L234)
to our [huge remote builder](https://git.nixos.lv/NixVegas/systems/src/branch/main/devices/citadel/default.nix).
It had access to a [ChipWhisperer Husky](https://www.newae.com/product-page/chipwhisperer-husky)
(where I managed to help it automate power analysis and fault injection against the example target boards
and could recover a RSA key from a Lattice iCE40 FPGA in 2 minutes, but that's another blogpost).

# Making a SBC

With all the annoying things suddenly easier, it was time to design an SBC and
_not_ have it feel like work. We added all the trimmings for maximum
hackability: LEDs, connectors for SAO and small OLEDs, USB, ethernet (the
Sophgo SG2000 has a built in 10/100 ethernet PHY whereas the Waveshare module
certainly does not), a [CH347](https://www.lcsc.com/product-detail/USB-ICs_WCH-Jiangsu-Qin-Heng-CH347T_C5122332.html) serial/JTAG to USB adapter,
USB mode switching circuitry, a supercap for keeping the RTC alive between battery swaps, and even
a DSI to HDMI adapter.

The boot selection switch was particularly interesting. Since the ARM and
RISC-V cores are strapped with a hardware pin from the mask ROM, I settled on a
three way switch, with "auto" wired to a latch on the always-on RTC bus.
Linux can control it with a GPIO, or you can manually override it to the ARM or
RISC-V core. At the end of the day, the ARM core was the faster one (the RISC-V
core was an Alibaba one), so we manually moved the switch there for everyone.

Regardless, our testing showed that the mask ROM looks for a `fip.bin` in the
first FAT32 partition for the correct architecture, so switching between ARM
and RISC-V requires a minor SD card change too. We'd certainly like this _not_
to be the case, but it will take a bit more research, although we may have
figured it out while writing this blogpost. (In the meantime, we created a
nix-badge bootswap command to do exactly this).

# KiCad 10 routing woes

Component selection and placement was done, it was time for routing. 

KiCad had some major stability issues this year for us since the [recent 10.0
update](https://www.kicad.org/blog/2026/03/Version-10.0.0-Released/). It seems
like it was mostly happening on an older Haswell and a newer Ryzen 5 Framework
laptop that was being frequency throttled. I bet that the situation improves
over time, but we had enough on our PCB that KiCad was constantly unstable when
working with it, even after I [merged an update](https://github.com/NixOS/nixpkgs/pull/535912#issuecomment-4815969771).

![](/img/blog/2026-badge/lgtm.png)

> Didn't stop all the crashing, but shipped on the badge.

However, a good Nix environment and enough in-repo scripting
was enough to puppet KiCad's Python API and make targeted board changes when
the UI failed us. There's also [tscircuit](https://tscircuit.com/) and
[atopile](https://atopile.io/) now, maybe we'll use these next year too.

Still, we couldn't fully escape placement and routing. The initial routing pass
for the Nix Badge v2 was ~10 days of solid work in the evenings and weekends. I
am hoping the tools improve, but am skeptical about how much. There is a lot of
project context that automatic placement will simply not always get right. PnR
is also usually tuned to contiguous geometric shapes, and the Nix logo, while
[mathematically perfect](https://github.com/nixos/branding), is not pleasing
for an autorouter due to the gigantic hole in the middle. For the "I want to
do one targeted change" usecase, automation worked fine.

# Colored silkscreen

Our badge had [our art](/blog/2026/artwork/) and the [NixOS pride colors](https://brand.nixos.org/logos/nixos-logo-rainbow-gradient-black-regular-vertical-recommended.svg)
on it. For our first test of PCBWay's colored silkscreen service, it passed flawlessly. 

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/eccd7866-4921-43f9-9977-f7e184ee5c5c/preview)

> Samples from PCBWay arrived and they looked amazing

In any case, I haven't found many people writing about how to actually use
PCBWay's UV printing, so feel like I need to go into detail here, since having
this information would have saved us multiple design iterations (which is a
typical thing that people ignore when pushing the red button on a PR they don't
like, but I digress).

**There is no standard way to do colored silkscreen in PCB design, period.**
There simply aren't standard Gerber layers for it, and KiCad 10 does not
support anything beyond monochrome silkscreens with overlaid reference images.
In fact, if you import a colored SVG such as a vectorized version of our art,
KiCad will convert it to a monochrome point cloud, throwing out any bitmap data
and all of the information about colors, vector layers, and even rotation. 

We ended up writing scripts (with a little help from Fable 5) that could
recover SVG layout from KiCad's point clouds with a little linear algebra, and
compile master SVGs from the originals in the repo with position, scale, and
rotation implicitly indicated in the KiCad project. This allowed us to use
KiCad mostly as normal, and pushed the color silkscreen generation (including
merging text layers and solder mask knockouts) to be part of the build process.
It also would let us gracefully degrade to monochrome silkscreen for PCB fabs
that don't support color as part of their process.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/ea937f3c-a7d2-47f8-84ce-9f68c60dbc3f/preview)

> Solder mask knockout behind the eye with rear illumination. We'll knock more out on v2.1 so the LED shines through better.

**PCBWay (as opposed to JLCPCB) does not require a strange encrypted SVG format
for their colored silkscreen.** Instead of [vendor locking you](https://www.youtube.com/watch?v=kOXwVfMk1NY) to EasyEDA, you
[simply provide high-resolution (1200+ dpi) PDFs alongside your gerbers](https://www.pcbway.com/blog/News/Unlock_Color_PCB_Printing_with_PCBWay_0939d559.html),
with a lower resolution reference indicating the front and back. However, their
documentation is somewhat incomplete. You should also leave out your normal
silkscreen Gerber layers if you are only using color silkscreen, since there
are two separate assembly lines for the UV color printer and classic silkscreen
process, and it is confusing for PCBWay if you have normal silkscreen indicated
in your order but do not provide the corresponding layer in your gerbers.

We already mostly reverse engineered JLCPCB's silkscreen format last year, so
could include that as part of the build too. But PCBWay's approach ended up
being simpler even if it had its own gotchas.

![](/img/blog/2026-badge/UV-Print-Reference.png)

> Example reference photo.

**PCBWay can print normal silkscreen alongside colored silkscreen, but you may
not want to do this.** The quality of our PCBs' silkscreen was amazing after we
clarified that we did not want normal silkscreen and only wanted color, which
was a mistake we made when setting up our PCB order. In fact, I suggest just
not using normal silkscreen and using only color, and exporting your board text
and footprint markers to be part of the color silkscreen images. Our build
process did this for us, and the results were amazingly high quality. The
alignment between the silkscreen and solder mask was also flawless, which
allowed us to include some of our art as solder mask knockout, but even better
than last year.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/af0498cb-84fa-45e1-8241-fabea80ef6be/preview)

> And the full rear view.

**PCBWay can print a serial number on your design if they see a part of your
_normal_ silkscreen layers that indicates it.** We accidentally baked the
["WayWayWay" marker](https://www.pcbway.com/blog/help_center/Notes_of_Product_No_on_Your_PCB_78d5a03c.html)
into our _colored_ silkscreen, so got asked where the placeholder for our
serial number was since it was indicated on our order but we did not have
normal silkscreen layers that contained it. We ultimately decided to change the
order so it didn't have PCBWay's serial number on the silkscreen, and ended up
with an unwanted but ultimately not dealbreaking literal "WayWayWay" on the UV
process layer. This basically just can't go on the color silkscreen layer and
has to go on the normal one. If you don't have a normal silkscreen layer, you
have to get rid of it, but this is not called out explicitly.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/c0b11824-3348-4f01-b07d-90250e326d6c/preview)

> Dan rockin' these colors year round.

Overall, the process had its gotchas but the results speak for themselves. The
boards turned out amazingly, and we are incredibly grateful to PCBWay's team
for their work fabricating and assembling them for us. 

# Supply chain

It's a mess. 

The normal passives and power circuitry, and even some digital components like
gates, buffers, and FETs were fine. Many active components such as our HDMI
bridge were either between supply cycles or just difficult to track down. 

The Milk-V Duo Module 01 was the largest single problem in the design, and
there was a very high chance we just wouldn't get it this year. June and July
created a contrast to the situation in February, which is when we scoped it out
and it appeared much easier. 

We ended up eventually contacting [Radxa](https://radxa.com/) which gave us a minimum and a quote
that would have arrived long after DEF CON. We may still take them up on that
if we get enough interest to do a second run. 

The interim situation, however, was bad enough, with almost every seller we
found on Alibaba claiming they had stock, only for it to mysteriously evaporate
when we pressed them on it. Always contact the seller. 

After long enough, we made the call for PCBWay to leave the SoM unpopulated. We
would do it ourselves. Somehow.

# The team that couldn't stop

OK, that's already a lot about the hardware design and procurement process, and
we're already on the topic. Let's talk about lead time.

We placed the order in very early July, a full two weeks earlier than last
year. That still wasn't enough. The assembled PCBs got here the Friday of DEF
CON, and only got to Vegas from San Diego through a heroic effort from one of
our team members (thank you Grant).

But they still were missing the Duo Module 01 SoMs. Luckily, we found a vendor
for the _dev boards_ which were decidedly less cool than our badge, and somehow
were cheaper than all the available SoMs we weren't able to find resellers for.
After some practice, we hot plated them to 360°C in my garage over video call
with a college roommate (thank you RJ) until all the solder around the SoM's
castellated edges melted, and pulled them off. After proving that one of them
wasn't simply destroyed by the heat by virtue of it booting, we brought 25 of
the recovered SoMs to DEF CON.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/a8a9e025-e030-4486-9dff-a608a0d8eab1/preview)

> Waiting for reflow over video call

When Grant got to Vegas Friday night, we checked for magic smoke, checked the
voltages (3v3 was somewhere between 3.3 and 3.4V, close enough), and experimented
with trying to attach the SoM. Ultimately, plenty of flux and solder paste did
the job with a high-precision iron. After flashing a very beta firmware and
solving what turned out to be a component placement problem that broke ethernet
with our soldering irons, we had a single badge working for Saturday.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/35ee162c-dc8f-4d3d-83f7-9d6ac1962a6f/preview)

> Close enough.

Saturday night was the production run. We had a four stage pipeline. I'd solder
the SoM and poweron check it via my portable supply, Tristan would flash and
insert an SD card, Dan would add through-hole components and clean the board
with ethanol, and it'd be back to Tristan for the final check and bagging.
After flashing the final SD cards for our speakers, we got the badges out to
them Sunday.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/b37dc1e7-3594-4e68-ab78-df432c20dbbb/preview)

> Holding the first-ever NixOS Badge

We didn't do a prototype run because of supply chain lead time, and got 80%
yield after we soldered the badges in our room in the Fontainebleau. 5 out of
25 of them were dead, likely just due to SMD soldering mistakes on my part.
We'd go on to recover most of these on new boards.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/c6ff5ace-0234-4142-841c-aca442c42393/preview)

> OK, it was late, and we only wore safety glasses _most_ of the time.

... Wait, what?

Yep, that's right, that design review from Fable allowed us to oneshot working
PCBs to and from Shenzhen with 80+% yield. They're a .0 release, so there are
minor hardware bugs (voltage dividers for battery measurement were too high
resistance to always get accurate reads via our ADC), but still. When it booted
and we got ethernet working, we cracked open beers at midnight because we did
it. We knew that we could hand them out to our speakers with a little more
work.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/fb22a0b8-3dc3-43b4-b91e-36427fc9fbe6/preview)

> Beer on the left. Ethanol/isopropyl mix on the right. Do not confuse them.

# Hacking

The first firmware we shipped was very "version 2.0." It could dual-boot ARM
and RISC-V with some sweet LED patterns (and we took them to parties Sunday
night), but the software could use some love.

![](https://relive.nix.vegas/share/photo/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/4bbfb5d7-bcc7-4d9e-8497-8a316d40429b/preview)

> Giving a Nix Badge v2 and v1 to the NixCTF winners (while live pwning hydra in the background)

Over the next weeks, we turned it into something a bit more polished, though
that's for a future blogpost.

<video class="video-loop" width="100%" autoplay muted loop>
  <source src="https://relive.nix.vegas/share/video/6ZE3in8vcoko7EtG8PC2CkG7d3_eyc68VTgMnGrKVRYsaTh9L_3VlNxZseOKXC4wUc8/9c017f1d-9e03-427a-9ce6-dc7f8551e349" type="video/mp4" />
</video>

# Conclusion

Thank you again to PCBWay for sponsoring the PCB fabrication, and to the advance readers
of this blogpost. We hope to do this again next year!

From the Nix Vegas #badgelife team to you, party on (and maybe see you at [Gothcon](https://x.com/dcgothcon) next year)

<div class="img" style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/KBSX91MixSQ?rel=0" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen scrolling="no" allow="accelerometer *; clipboard-write *; encrypted-media *; gyroscope *; picture-in-picture *; web-share *;" referrerpolicy="strict-origin"></iframe></div>

<script type="text/javascript">
// Shamelessly stolen from MDN.
let videoElems = document.getElementsByClassName('video-loop');
if (videoElems) {
  for (const videoElem of videoElems) {
    try {
      let startPlayPromise = videoElem.play();
      if (startPlayPromise) {
        startPlayPromise
          .catch((error) => {
            if (error && error.name === "NotAllowedError") {
              videoElem.controls = true;
            }
          });
      }
    } catch { }
  }
}
</script>
