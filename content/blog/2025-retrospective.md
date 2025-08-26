---
template: "blog_templates/base.html"
title: "The road to rebuilding the world"
authors: ["the Nix Vegas Team"]
description: "Looking back at DEF CON's first Nix Community"
date: "2025-08-25"
extra:
    show_toc: true
---

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/32d61bfb-0470-4761-8e13-d7d581324548/preview)

----

## Intro

Just recently, a group of friends, colleagues, and classmates ran the first-ever Nix Community at DEF CON.

We initially started planning Nix Vegas around March 2025, though this community is the culmination of several years of work by [many](https://github.com/NixOS/nixpkgs/pull/111518) [people](https://github.com/NixOS/nixpkgs/pull/291049). Over the next 4 months, we figured out various aspects such as theme, artwork, speakers, sponsors, and the Nix Badge. Eventually, we delivered a reliable network, great talks, and a fun badge.

We want to thank all of our [speakers](/speakers), [sponsors](/#sponsors), and attendees. This was peak DEF CON for all of us.

Additionally, thank you to Dark Tangent for having us this year, and the DEF CON Goon team for their tireless work and patience as we attempted to put a major twist on our efforts on Planet Nix to fit the vibe of DEF CON. The experience of running a DEF CON Community was fantastic, and we would like to highly encourage others to try to run something yourself based on our first-time experience this year.

----

Running this event required us each to wear a lot of different hats. Our retrospective is broken down by the different types of work that were required, which also ended up being somewhat chronological.

While the surprise of reveals like the [badge](https://github.com/NixVegas/pcb) will always be a fun part of DEF CON (and we can promise more such surprises in the future), we are an open source project at heart, and do our retrospectives in the open.

"Despite the wisdom of defeat, I bore my heart for all to see" \
\- VNV Nation, [_Standing_](https://www.youtube.com/watch?v=z9kzZ6Hdylo)

REBUILD THE WORLD!

<3: @numinit, @djacu, @RossComputerGuy, @crertel, @agbrooks, @thedewmaster, @blorx, @noisycat, @TheRabbi, @tomberek, and others

----

## Links

- [Photo album](https://relive.nix.vegas/share/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc)
- [Talks](https://relive.nix.vegas/share/qRwLI0HgaiPzArL2oPcD1iR64UY-U51EgdrBuUN3KA2tzuQN9TEFXHqhCL3LL761Cvw)
- [Linux Unplugged Coverage](https://linuxunplugged.com/627)

## Theme

"Make no plans. Set goals, develop strategies and tactics." \
\- Pieter Hintjens

Every DEF CON has a theme, and the theme this year was [Access Everywhere](https://defcon.org/html/defcon-33/dc-33-theme.html). Shortly after the theme came out, we submitted our DEF CON Community application at Planet Nix after some discussion with other Nix people at SCaLE.

The theme prompt was too perfect: _Imagine that we're building the digital commons from scratch._ Lots of us work on nixpkgs, we don't even have to imagine! If you've ever done a PR with thousands of rebuilds, you know just how much you're building from scratch.

> Imagine that we're building the digital commons from scratch. What could we do to make sure everyone benefits? How would we make it a freer, healthier place to inhabit? How do we protect each other from the worst parts of the current system?
>
> - Services should be usable no matter who you are.
> - Services should be accessible no matter where you are.
> - Services should not violate user privacy or security.
>
> \- [DEF CON 33 Theme](https://defcon.org/html/defcon-33/dc-33-theme.html)

After some initial work on the naming for the event (and picking up the nix.vegas and nixos.lv domain names), we got our website up by the end of April after forking [Planet Nix](https://planetnix.com/)'s Zola static site generator and combining it with improvements from [socal-nug.com](https://socal-nug.com/). We got some theme materials up, but knew they were temporary while we were figuring everything out.

@numinit: That also ended up being around the first time I went to the [RSA Conference](https://www.rsaconference.com). I remember getting back from RSA and thinking just how absurd parts of that conference were. I was still completely unsure what "identity governance" meant after spending multiple days being sold it. So I put it into ChatGPT, and had it generate me progressively more excessive RSA booths for a fictional product named ["SAASiroth"](https://www.youtube.com/watch?v=dLTUqPue9sQ), featuring the Tree of Life from Kabbalah (or [Evangelion](https://evangelion.fandom.com/wiki/Tree_of_Life)).

![](/img/blog/2025-retrospective/rsa-booth-gen.png)

> Yes, technically KRAZAM inspired the Nix Vegas theme, even kind of indirectly. I hope they eventually come to DEF CON just to do an after hours comedy act.

### Enter Yggdrasil

@numinit: Lying in bed on a family trip to Long Beach, I had it generate (also obviously absurd) NixOS RSA booths following the same theme. One of the gens ended up accidentally intertwining the roots of the tree with a mangled version of the NixOS flake logo. But, wait, this seemed like it could have potential! Instead of picking the Tree of Life, it picked [Yggdrasil](https://www.britannica.com/topic/Yggdrasill), the World Tree!  Alpine Linux has the ["world file"](https://docs.alpinelinux.org/user-handbook/0.1a/Working/apk.html#_world), and Gentoo has [@world](https://wiki.gentoo.org/wiki/World_set_(Portage)). There's even the [Yggdrasil Network](https://yggdrasil-network.github.io/), a recent mesh VPN.

![](/img/blog/2025-retrospective/tree-of-life-gen.png)

And that's when Dan pointed out that the roots of the world tree could be the GC roots, and the branches and leaves were the directories and files in nixpkgs. We added [Nidhogg](https://norse-mythology.org/gods-and-creatures/giants/nidhogg/) to represent either the garbage collector or the [threats](https://github.com/jiat75) to nixpkgs' supply chain security.

## Sponsor us to rebuild the world

"Communities need some kind of financial backing. This is the jagged rock that breaks most ships. If you starve a community, it becomes more creative but the core contributors burn out. If you pour too much money into it, you attract the professionals, who never say "no", and the community loses its diversity and creativity." \
\- Pieter Hintjens

By the end of May, our theme was Rebuild The World. We could finally get some real art made.

Simultaneously, Tristan was working on getting help from System76 and Ampere. We were previously sponsored by [Protectli](https://protectli.com) for our [DEF CON 32 mesh networking shenanigans](/blog/dc32-nixmesh/) the year earlier, and we weren't even a community yet. With the combination of Protectli, [System76](https://system76.com/), [Ampere](https://amperecomputing.com/), and [Next Computing](https://solutions.nextcomputing.com/), we had all three of networking, compute, and storage solved on the two major architectures. Our theme was starting to look realistic.

With some sponsor cash in hand from [Determinate Systems](https://determinate.systems/), we contacted a local artist, [Kenz Tobias](https://www.twitch.tv/kenz_tobias_art) from [Battlemage Brewery](https://www.battlemagebrewing.com/) in Vista, CA. Kenz had drawn a lot of the art for Battlemage's D&D campaign:

![](/img/blog/2025-retrospective/kenz-dnd-art.jpg)

Somewhere after that, we got sponsored by [Flox](https://flox.dev/), who also offered to subsidize speaker badges. Considering that DEF CON badges are [expensive](https://media.defcon.org/DEF%20CON%2033/DEF%20CON%2033%20receipt.pdf), this really helped.

### Aside: on sponsorships

Running Nix Vegas was a labor of love that could not have been possible without sponsorship. In the future, we hope we can continue to maximize the benefit that participants directly get from our sponsored equipment and services:

- The combination of Determinate Systems and Flox's sponsorships helped us do many things, including paying for [Sessionize](https://sessionize.com/), subsidizing badges for speakers, and paying Kenz fairly (i.e. identically to a speaker badge) for her [amazing artwork](https://nix.vegas/blog/artwork/).
- Protectli hardware ran our network from a single i7 [VP6670](https://protectli.com/product/vp6670/). We additionally have three [VP2420](https://protectli.com/product/vp2420/) units (which make great BATMAN mesh nodes) that we were considering putting at attendee tables for access to our network, though we ultimately didn't pull them out for this DEF CON due to time constraints.
- Next Computing and Ampere's [flyaway kit](https://solutions.nextcomputing.com/products/fly-away-kits/nexus/) directly provided access to the 140,000+ packages in nixpkgs that we had cached. We hope to devise a way to provide attendees access for running remote builds next DEF CON, similarly to a [community builder](https://nix-community.org/community-builders/).
- A 192-core [System76 Thelio Mega](https://system76.com/desktops/thelio-mega-r4-n3/configure) ran our stream, served as a failover for the binary cache mirror we had up for attendees, and ran some of the larger builds during the PR review sessions we had. We hope to similarly provide access to this next year if we come back.

We want to be able to maintain a similar structure in the future, since we were ultimately able to sponsor all of our speakers' badges. The rest of the conference, including signage, stickers, shirts, materials, hardware, and Nix Badges that wasn't itself sponsored was all at direct cost to the organizers.

@numinit: Managing taxes for sponsorships effectively required using an LLC and a dedicated bank account. If you ever do this and aren't _specifically_ a 501(c)(3), the sponsorship counts as income, so just be aware come tax season.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/8ad13876-25f8-4255-8359-1b047db9c280/preview)

> You have to pay the cat tax when you do a writeup, so here's Autumn, one of Tristan's cats.

## Media & Socials

"He will win whose army is animated by the same spirit throughout all its ranks." \
\- Sun Tzu

For us, this spirit was Kenz' [artwork](https://nix.vegas/blog/artwork/), as we worked to theme everything around it.

Kenz' designs turned out so well that we got a metal sign made, over a thousand stickers printed, and a bunch of very comfortable t-shirts from [DCL Productions](https://www.dclproductions.com/) to show it off. (Of note, no one solved the puzzle on the artwork reveal page, it would have revealed that we were doing a badge and how to get one).

The artwork was a huge deal for us, it was so awesome that we wanted to put it on everything, badge PCB included:

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/1e48c538-901e-4e9d-8eef-5bcc0599176f/preview)

The colorful art heavily influenced the RGB vibe we had going within the space itself, with floodlights and standing lamps that complemented it:

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/544de909-ade5-42f2-a881-e9f5c6bb5ebd/preview)

One of the last hail mary attempts at art-related things we pulled off was providing coloring sheets using a FedEx Kinko's in the Fontainebleau. After a doordash order of crayons, colored pencils, and a couple more cat6 ethernet cables from Staples to plug into our switch, we had another way to interact with Kenz' art at con.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/d9230387-69d0-4aba-8bc3-cf3a374e3127/preview)

> Coloring, anyone? (apparently, yes!)

## NOC

"Physical closeness is essential for high-bandwidth communications." \
\- Pieter Hintjens

We had [practice](https://www.socallinuxexpo.org/scale/22x/presentations/adventures-mesh-networking-def-con-nixos) from the past 3-4 DEF CONs as we attempted to push Nix binary caching to the edge, but for an entire community this time instead of just a small group of friends. This year would be [bigger, better, and faster.](https://www.youtube.com/watch?v=KBSX91MixSQ)

@numinit: The three weeks leading up to DEF CON was when we got all the hardware together. We immediately realized we needed a larger core router, and the [Protectli VP6670](https://protectli.com/product/vp6670/) fit the bill with its two 10G SFP+ slots.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/c1b33c35-70a3-409f-a71a-1dc463bcae99/preview)

> Big router, big antennas.

We set the network up so the core router would bounce connections for all the other hosts using a combination of reverse proxies (e.g. for the binary cache) and nftables rules. This ultimately let us pick and choose what was passed through to attendees. The Next Computing and System76 boxes were all trunked to the central router on the high speed 10G build network. Having a 10-core router everything could flow through was super useful!

Chris brought a huge managed switch, and we plugged that into the port we had reserved for the attendees. In the future, we'll probably VLAN clients off from each other, though it was probably useful for some people to be able to hit each other over our switch, so it'll be a balancing act, especially since the nftables rules to prevent client-to-client on the switch using VLANs looked somewhat gnarly.

Off to the side of the attendees' network, a dumb switch connected together the NOC network, comprised of all the BMC management ports and low-speed interfaces. Routing over the NOC network was deprioritized, though it could also serve as a default route.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/e500b5db-76d1-4df7-bc82-d60103264501/preview)

> The hardware stood up during testing in the weeks before DEF CON. Bonus exercise wheel for Tristan's cats.

### Through the Looking Glass

All default routed traffic egressed over [Nebula](https://search.nixos.org/options?channel=25.05&size=50&sort=relevance&type=packages&query=services.nebula) to an [EDIS Global](https://www.edisglobal.com/) node in LA. Setting this up involved a false start of buying a VPS in Las Vegas through another hosting provider, but we switched to EDIS Global because their [looking glass](https://lg-lasvegas.cloudzy.com/) tests revealed that routes to speedtest.rd.lv.cox.net almost always got routed by Hurricane Electric through Los Angeles. Recognizing that we'd be routing VPN traffic out of Vegas through LA anyway, the [EDIS Global LA looking glass](https://uslax.edisglobal.com/) was a lot more promising: they seemed colocated with a Fastly cache.nixos.org endpoint with a ping of less than a millisecond!

```
Start: 2025-08-16T23:09:37+0200
HOST: nocUSLAX                           Loss%   Snt   Last   Avg  Best  Wrst StDev
1.|-- ???                                100.0    10    0.0   0.0   0.0   0.0   0.0
2.|-- ae0-3101.bb1.lax1.us.m247.ro        0.0%    10    0.6   0.6   0.5   0.8   0.1
3.|-- 206.72.211.175.any2ix.coresite.com  0.0%    10    0.6   0.6   0.5   0.9   0.1
4.|-- 151.101.194.217                     0.0%    10    0.5   0.6   0.4   1.6   0.4
```

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/cac70483-b455-48ec-a28f-5c44f80ab8d9/preview)

> Our NOC diagram.

After forcing the route to LA, we ended up with ~10-15ms RTT to our VPN endpoint. Not bad for egressing from Cox in a convention full of hackers! 700 Mbps to them from my home network was nothing to scoff at, either.

### Caching the world

With a couple weeks left before DEF CON, we got [great-value-hydra](https://github.com/NixVegas/great-value-hydra) working to substitute everything from [release.nix](https://github.com/NixOS/nixpkgs/blob/release-25.05/nixos/release.nix) over the tunnel to our EDIS Global instance. This was the first network stress test. Ultimately, we ended up with the vast majority of of 25.05 and unstable for aarch64 and x86_64 on Linux and Darwin loaded onto Saitama (one of the ARM nodes in the Next Computing flyaway kit) after multiple terabytes of downloading. After a couple more drives and a raidz expansion later in the week leading up to DEF CON, we had a proper pool full of Nix packages.

We served our cache directly from the Nix store using [Harmonia](https://github.com/nix-community/harmonia). The combination of `compression=zstd-9` and `dedup=on` on the ZFS dataset really helped, and we ended up with a much better compression ratio than we otherwise could have. In case you were wondering what the ZFS dedup tables looked like for all of 25.05 and unstable, here they are:

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/e2ad2e69-ef26-45e0-9f0a-af65ba9d7c6f/preview)

@numinit: Note that Harmonia has some [logic](https://github.com/nix-community/harmonia/blob/harmonia-v2.1.0/src/narinfo.rs#L92-L100) that is yet another example of a Nix cache server doing signatures in a way that has potentially subtle security implications! I mentioned some in my [Planet Nix talk](https://youtu.be/a2NeKtDCWhw?si=VOJQ60PDaMs0wItj&t=1078) for nix-serve, nix-serve-ng, and NCPS, but yet another? We need to RFC a fix for this 😱.

### Rebuilding the world

At the same time, we had [Hydra](https://github.com/NixOS/hydra) running. When we had cached everything, most of the evals were no-ops because they were already built upstream. (Of note, we expected to need to build unstable, but had it mostly cached instead since our fetch finished ahead of schedule.)

We had an absurd amount of hardware. The Next Computing box (Saitama, Tatsumaki, and Genos) performed amazingly, as did the System76 Thelio Mega that we used for streaming and builds.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/5982ae71-e2d0-4c81-977b-c8d3f212dae4/preview)

One note: it's probably wise to either mirror upstream Hydra on a dedicated binary cache instance that doesn't have a Hydra running on it, or ensure that all the paths are different somehow, since Hydra builds were clashing with what we had fetched and it's possible to mess up some of the signatures that way. Perhaps next time we'll have images made using our locally built caches. In practice though, this wasn't a problem.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/8830b024-3bdf-4459-8b17-677970f58597/preview)

> Yes, there were stickers.

### Onboarding

The last couple days prior to leaving for Vegas involved getting a simple onboarding process working with our binary cache.

Ultimately, our NOC job was very unique: we weren't just running a network, we were generating NixOS images that our binary cache and Hydra server at DEF CON could both bootstrap and accelerate. After thinking about an idea @crertel mentioned for setting up a fast onsite onboarding experience, we ended up serving [everything](https://github.com/NixVegas/systems/blob/ca01c91dfe3e946fed590e5c082382dec2d548c8/pkgs/onboarding/default.nix#L24) that was built straight from our binary cache, including the NixOS channel itself, ISOs and netboot images, as well as the manual and a [nixos-pagefind](https://github.com/jaculabilis/nixos-pagefind) instance. In the future, running a full [search](https://search.nixos.org) instance or an improved pagefind would be useful.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/eb1968fc-f0b2-46eb-adbf-50d94b6d98a7/preview)

> Netbooting a laptop in a neighboring community over powerline ethernet.

At the end of the day, users could connect to the NixVegas wifi network or plug into our switch, hit https://nixos.lv, and they'd see our onboarding site:

![](/img/blog/2025-retrospective/onboarding.png)

We used commit [ce01dae](https://github.com/NixOS/nixpkgs/commit/ce01daebf8489ba97bd1609d185ea276efdeb121) for everything, which happened to update knot-dns, which we were using [very heavily](https://github.com/NixVegas/systems/blob/main/devices/ghostgate/default.nix#L849) on our network. Thanks @vcunat!

## Setup

Setup for the NOC went pretty smoothly once we got power and A/V installed later Thursday. Since almost everything in our space relied on having a functional NOC, this was really important.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/7de092ea-2253-4858-bcf0-f7c65f6c7bca/preview)

> The space after setup, close to 1 AM Friday morning

Getting on the DEF CON wifi network was a [simple config change on our router](https://github.com/NixVegas/systems/commit/3419473bd121fb30a26742d145188f46bbf11b21) after registering on DEF CON wifi. This took an oddly long time though because of [recent changes in wpa-supplicant](https://search.nixos.org/options?channel=unstable&from=0&size=50&sort=relevance&type=packages&query=ext%3A) and NixOS simplifying how passwords are loaded in a way that made it necessary to change our configs from last year, and it not being obvious why something wasn't working (spoiler: it was because supplicant was trying to use `ext:dc_wifi_user` and `ext:dc_wifi_pass` as the literal username and password).

@agbrooks: Providing a NixOS module for defcon wifi setup would be low effort/high impact (it's kind of a pain to set up, we have the cure, others should too).

## Speaker Ops

"The accuracy of knowledge comes from diversity." \
\- Pieter Hintjens

We ended up having 12 talks including the [DEF CON Community Stage talk](https://hackertracker.app/event/?conf=DEFCON33&event=61513). Badge distribution using [live drop](https://en.wiktionary.org/wiki/live_drop) passphrases worked really well, we'll probably solicit the passphrase earlier from speakers if we're able to sponsor badges for them next time.

Learning how Hacker Tracker worked (and the respective deadlines) was probably the most of our learning curve. We had all of our sessions in Sessionize, but no idea we could just send all of them to the Hacker Tracker team for import using the Sessionize API! Once we learned about that, it was way too easy.

That being said, we had great attendance at talks. Some of our talks were standing room only.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/fc11bcf0-442d-40c1-b219-71c6e7f6679a/preview)

> The [Thelio Mega](https://system76.com/desktops/thelio-mega-r4-n3/configure) running our A/V while doing hundreds of Hydra builds

Food for the team (and speakers) was best handled via bulk buys of pizza and bagels. We'd _totally_ do this again. :-)

## Maybe A Few Hydra Failures

Live PR merging on-stage was an idea that came up at Planet Nix at the Flox dinner with Tom, Tristan, and Dan. Naturally, we had to do it. People shouting out PR numbers to someone with a commit bit while trying to build 2-3 of them at once just sounded fun.

@numinit: My rejected name was "Whose PR Is It Anyway." Dan came up with "Maybe A Few Hydra Failures" after [SNUG #12](https://socal-nug.com/events/2025-08-01/) and we collectively lost our minds laughing for like 5 minutes.

Honestly, this event was a blast. Speaker feedback indicated that it was unexpectedly entertaining, which is what we go for around here. 😛 We got around 10 PRs tested and merged over the two days we were running the space at the conference. We definitely should have preloaded nixpkgs on the box though, that was a planning failure on our part. Shallow clones, patches, and some targeted builds won the day though.

### Making contact

One of the coolest PRs we merged onstage was [#427048](https://github.com/NixOS/nixpkgs/pull/427048) for [Contact](https://search.nixos.org/packages?channel=unstable&show=contact&query=contact). In addition to being a [Jodie Foster movie](https://en.wikipedia.org/wiki/Contact_(1997_American_film)) that helped get me into amateur radio in high school (and was fantastically sampled by [Assemblage 23](https://www.youtube.com/watch?v=-_7C2S0Z7sc)), it's also a console UI for Meshtastic. We actually tested it by plugging a terminal into our build machine and getting on the DEF CON Meshtastic mesh. LGTM!

![](/img/blog/2025-retrospective/contact-merge.png)

> Announcing that we're merging the PR for Contact on the DEF CON Meshtastic mesh, using Contact

This is the exact kind of event that would benefit from remote participation. The Owncast chat had a couple PRs that got merged, if no one else has one it was a great thing to turn to. Thinking about remote participation is a great idea in general, and we should do it more.

## Badge

"Never design anything that's not a precise minimal answer to a problem we can identify and have to solve." \
\- Pieter Hintjens

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/90f50504-0bb7-469d-bdbe-86c916a29db1/preview)

The problem here was "we want a wearable Nix flake at DEF CON that can act as a binary cache," and the version 1.0 answer worked except for the SD card, which was a last minute addition. Minimal solution to Nix flake-shaped reproducible hardware achieved!

In all seriousness though, none of us had done a badge (or even a [SAO](https://hackaday.com/2019/03/20/introducing-the-shitty-add-on-v1-69bis-standard/)) before, and it was some of our first time at DEF CON. We're still kind of in disbelief that we pulled the Nix Badge off, considering that the final badge shipment arrived Tuesday the week of DEF CON. That's the real reason we were quiet about it until the conference: there was a nonzero chance that it just wouldn't happen.

@numinit: I started with the new [official logo](https://github.com/NixOS/branding) as the PCB shape, and decided to look at RP2350 reference designs that used USB-C, since I had a couple dev boards on hand. After some absolutely wild guesses at the size of the PCB and chatting with @TheRabbi about fabrication options, I settled on around 5 inches from point to point.

This was my first time using KiCad for something this complex ever, so there was a lot of learning curve. After struggling to adapt [some existing](https://github.com/sabogalc/project-piCo) RP2350 designs, I had fumbled enough at KiCad that I was actually starting to get decent.

So, I did what any engineer should do at this point: ask people with more experience (again, thanks @TheRabbi for my dumb questions about JLCPCB), stop reinventing the wheel, and just use a damn [esp32-c6-mini](https://www.espressif.com/sites/default/files/documentation/esp32-c6-mini-1_datasheet_en.pdf) because it's well supported, has a bunch of peripherals that I'm sure we'd figure out how to use, and [works well with Nix](https://github.com/mirrexagon/nixpkgs-esp-dev). The integrated wifi antenna was a bonus: maybe I'd trust myself to draw antenna traces in a future PCB rev, but it was definitely not the year for that. It, however, was going to be the year that we could just `nix build` a whole PCB and firmware, and that was cool enough. True artists ship, and this was a minimal solution, after all.

### And then the feature creep happened

Once we had gotten past a [counterfeit batch](https://goughlui.com/2021/03/27/note-linear-regulator-woes-when-is-an-ams1117-not-an-ams1117/) of AMS1117 voltage regulators and put the final PCB order in with a fixed power supply circuit, we could finally focus on the firmware.

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/f3cb67a3-81a7-4060-b283-6474a56ee94b/preview)

> 3v3 rail showing 2.9V when connected over USB? Nein danke!

So, OK, fine, let's let _some_ feature creep happen. Part of the first Nix badge's features had to be a demo that you could do something simple using the badge itself that interacts with Nix. So, it was time to build the world's simplest HTTP substitution server.

### 802.11s, or not?

After a lot of experiments trying various mesh topologies, Tristan and I settled on [esp-mesh-lite](https://github.com/espressif/esp-mesh-lite), which is an IP based mesh topology that, critically, lets you connect to a wifi network that your badge spawns without your client also being another ESP32. Espressif already has [esp-wifi-mesh](https://www.espressif.com/en/products/sdks/esp-wifi-mesh/overview), which uses a custom routing protocol on top of 802.11s, so even if you could get another mesh node connected, it wouldn't be Linux compatible. Since the 802.11 interface is probably the fastest interface on the ESP32 apart from SDIO, it seemed obvious that it could work as a Nix substituter.

### Yeah, let's pull NARs over an ESP32 mesh

Tristan ended up basically allowing for three configurations on the badge, in ascending order of battery-killing fun:

- Wifi off, color fading bling on. (In this default configuration, the three AAA batteries lasted all conference).
- Wifi on, looking for the NixVegas wifi to use as an upstream binary cache and other badges to ping over the mesh. (In this configuration activated by holding the button while booting, you'd better have it plugged into USB, or it'll kill your batteries in a matter of hours.)
- Wifi on, looking for the NixVegas wifi and _any other badge_ to use as a substituter. This is only activated with a config change in the NOR flash, because of how slow it is without a working SD card.

Of note, some of the business logic for the badge is written in Zig, because it's literally trivial to install a complex dev or build environment with Nix. Letting others easily hack on it despite many quirks of the ESP-IDF was just a change to the build and shell derivations.

The ESP-IDF, I've got mixed feelings about. A lot of it is really convenient, but I also think we're going to gradually be ripping out what we can and replacing it with Zig and Rust. Please feel free to send C99 hatemail to our [Github PR inbox](https://github.com/NixVegas/badge), we'll probably merge it.

### Reproduce this build

A lot of things were a mad dash in our first year as a DEF CON community, and some of the badge hardware and firmware was no exception. Version 1.0 of the Nix badge is not the last, considering that we wired VDD and VCC backwards on the SD card slot. 😛

![](https://relive.nix.vegas/share/photo/4X5iSIGNNoEahvsPfQmthoHCl5VKLKjAnpFdKWXluUea_WH_dodGtoDyvEk4osXlBYc/63b9c131-1e21-4452-afeb-8a7ff2691a81/preview)

> We even got speedtest running over it!

What I really hope is that open source does what it's best at. Fork it, make changes, and do it how you want. We'll have plenty of changes coming up that others can build on, and even some future sponsorship for it. :-)

(If you got a Nix Badge this year at DEF CON, maybe consider contributing 😉)

## Conclusion

In certain ways, it felt like there were years of leadup to one week in Vegas for DEF CON. We've grown from a few friends running complicated NixOS infra setups at DEF CON to a whole community with unique art, sponsors, livestreamed talks, terabytes of cached Nix packages, and the first Nix Badge.

For next year, here's a hint: **Nix fixes everything. What can _you_ fix with it?**

- What's the weirdest machine you can get a Nix-based Linux distro running on? (maybe you have a [Sun server blade](https://wiki.gentoo.org/wiki/Sparc/Sun_hardware_compatibility_list) a [Dreamcast](https://oldvcr.blogspot.com/2023/02/dusting-off-dreamcast-linux.html), or a [proprietary photo frame](https://github.com/NixVegas/nixpwned) laying around, or just want to replace OpenWRT on your ancient router?)
- Ever thought about ["nontraditional"](https://en.wikipedia.org/wiki/Weird_machine) execution environments for Linux packages, or maybe Nix evaluation itself?
- Does the idea of finding a sandbox escape in Nix builds fill you with excitement?

Ping us on one of our socials with #nixfixesthis if you've got ideas. :-)
