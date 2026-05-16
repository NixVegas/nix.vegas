---
template: "blog_templates/base.html"
title: "Adventures in NixOS Mesh Networking at DEF CON"
authors: ["numinit"]
description: "Experimenting with mesh software delivery at DEF CON using NixOS"
date: "2025-06-03"
---

_At DEF CON 32, a few friends pushed binary caching on NixOS to its limits. Thanks to a generous hardware donation by Protectli, we managed to get a mesh network of binary cache servers running in our backpacks at the conference, with Nebula mesh VPN and 802.11s mesh point wifi running between them using the onboard TPMs for key exchange. Follow along to see what we learned, what we're planning in the future, and how you can do better than us as we try to push trustworthy Nix binary caching out to edge devices. With DEF CON 33 right around the corner and us trying to rebuild the world, it's time to publish this so we can share what we did in years prior._

![A few mesh nodes on a desk](/img/blog/dc32-nixmesh/protectlidesk.jpg)
> "I'd rather be working on my nix config" were famous last words last year.

In 2023, I attended DEF CON 31 with a group of friends from college, and we discovered just how abysmal network conditions were in the middle of the Vegas strip. With thousands of hackers in town, we could barely get 128k down from our hotel rooms in Harrah's. No internet access meant no binary caches, which meant no downloading software we may need to do things like reverse engineering the badge. We could only remote into our other hosts we'd prepared for the conference, with slow, unreliable connections. We had a discussion afterwards at a barbecue place next to the Flamingo, and came up with a few ideas.

## The idea

Could we do better at DEF CON 32?

What if we used 802.11s on a fairly high frequency band to make a mesh network for binary cache distribution? Most script kiddie packet injection knocking people off their network with deauth packets will target 2.4 GHz, and we have a little more breathing room on 5 or even 6 GHz. Even so, we can pick wifi adapters that support IEEE 802.11w now, and will get both management frame protection and forward secrecy if we use WPA3-SAE preshared keys and disable fallback to WPA2.

We even thought about how we could put some fairly large SSDs in our mesh network nodes, and carry them around all conference as long as they fit in a backpack and had power. We could replicate the Nix store on each of the hosts and our nodes would just cache everything that was missing for us. Plug in a laptop over ethernet, make sure Nix is configured correctly, and it's an instant local binary cache with fallback to other nodes nearby. Add a layer 3 VPN like Nebula on top, and nodes will just try all paths to each other, even possibly taking into account relaying to other hosts in between if it's configured that way.

**Note:** We were strongly operating on the assumption that internet connectivity would go down at DEF CON 32, so this made our entire design more defensive than it otherwise would have been. Even though it didn't actually turn out that way, it was an interesting design constraint!

## The hardware

After talking with the folks at [Protectli](https://protectli.com) (who are also based out of San Diego) we decided on three [VP2420](https://protectli.com/vault-4-port/) units and extended UPS batteries. Yes, they're x86, we could do better on power requirements if we went with something based on ARM. However, they also lasted all day with some testing by their engineers, had internal eMMC, a SATA connector for a 2.5" SSD, ran Coreboot, and had enclosures with 5 antenna mounts, useful if two of them were used for mesh wifi. I made the last minute call to try and get cellular modems working too, so the devices could be carryable secure VPN routers too. We were pushing the power budget a little, but, hey, that's what the `powersave` performance governor is for.

![](/img/blog/dc32-nixmesh/protectlicutaway.jpg)
> Innards of a VP2420 with crude labels.

**Fix Me:** We should just make the eMMC's rootfs read-only next time and do an [impermanence](https://wiki.nixos.org/wiki/Impermanence)-like setup with our SSD. We never had any problems with ZFS failing to boot, but ZFS is also not what belongs on an eMMC.

**Note:** Protectli's UPS products are "dumb" UPS units, but that's more than good enough for being in a backpack. They have a 12V input and a 12V output. If the input power goes away, the batteries stop charging and the output switches over.

## Cell modem shenanigans

Protectli provided a few [AMIT cell modems](https://protectli.com/product/mdg200-m2/) (they're seemingly just Quectel from an AT command standpoint) and I plugged them into the B key slots and wired up 3 out of the 5 antenna connectors, including one for GPS.

The modems just enumerate as cdc-ethernet devices and assign the host an address over DHCP. Once they're configured via a web interface that is _very obviously_ also running Linux and momentarily comes up with Fastboot when it's busy rebooting, they might even give you internet access over the carrier too.

I spent part of the day before DEF CON 32 reading Quectel datasheets about how to send AT commands to the modem's serial option devices to start up the GPS. Some cursed TCL knowledge and one `expect` script later, gpsd was up and actually receiving satellites on two out of three of the modems if I ran the expect script as a prestart to gpsd. One modem's GPS was a dud for some reason and never received any satellites, but worked fine with cellular.

![](/img/blog/dc32-nixmesh/protectliantennas.jpg)
> Hotel room plant for scale.

**Note:** IPEX-style RF connectors are terrible. There are multiple sizes (which I messed up) and you will break one or two. Hot glue is your friend.

## The layer 2 mesh

Meanwhile, [@agbrooks](https://github.com/agbrooks) was getting [nightwing](https://gitlab.com/andrewgrantbrooks/nightwing) working. 802.11s mesh point mode on devices that _also_ support WPA3-SAE and 802.11w management frame protection is a delicate dance of `wpa_supplicant`, drivers, and hardware. Luckily, we were on NixOS, so could do anything we wanted with a [couple](https://github.com/NixOS/nixpkgs/pull/291049) [PRs](https://github.com/NixOS/nixpkgs/pull/291062) to nixpkgs. We quickly settled on the versatile mt76x2u chipset with some adapters from Panda Wireless (the PAU0D worked wonders). Andrew had a prototype of mesh binary caching working fairly quickly, where he could put mesh nodes in as substituters and reduce the timeouts so Nix would try all of them in turn.

I found that Asia Wireless had a [M.2 B key version of this chipset](https://asiarf.com/product-tag/mt7612u/) that also enumerates as a USB device and works with Supplicant. Apparently there's one that uses M.2 E key instead that Protectli managed to procure too, but I couldn't find it so picked up a couple E to B transposer boards from Amazon and dremeled them to fit, then made sure they were stuck together with hot glue. Perfection.

**Fix Me:** Fewer hardware bodges are preferable. Also, remember to use a respirator and fume extractor when cutting PCBs with a dremel!

## Wireless client and monitor

We had way too many Panda Wireless adapters floating around everywhere, GPS working, and two USB ports left on the Protectli boxes. That obviously meant I had to write a [NixOS module for Kismet](https://search.nixos.org/options?channel=25.05&show=services.kismet.enable&from=0&size=50&sort=relevance&type=packages&query=kismet) and connect one of the adapters to conference wifi for an upstream WAN connection, and put the other in monitor mode.

The DEF CON wifi registration worked with some coaxing. As it turns out, the certificate chain DEF CON provides doesn't work in newer versions of Supplicant. Really, we just needed the root CA and correct CN/alt name config in Supplicant. Naturally, we had to discover this during the conference, but NixOS made it easy to hot redeploy everyone's mesh nodes over the mesh VPN itself.

![](/img/blog/dc32-nixmesh/kismetdump.png)
> Some of the SSIDs captured after being sorted, out of ~2000 unique SSIDs.

**Fix Me:** Just because an interface is up doesn't mean it should be used as the route for the internet VPN tunnel! We ran into a ton of captive portal issues in the Fontainebleau that repeatedly killed our access. That's probably another way something like [SCION](https://wiki.nixos.org/wiki/SCION) could be helpful.

## The layer 3 mesh

Alright, we've got a layer 2 mesh network set up, and plenty of transports to play with. A cellular modem, WWAN, and other mesh nodes can all act as gateways, but we still should assume that every way out of the DEF CON network is monitored. It's DEF CON, after all, and we don't want to end up on the Wall of Sheep or in a pcap from one of the thousands of people experimenting with RF monitoring. That means it's time for [Nebula VPN](https://nebula.defined.net/), which we've tested extensively at DEF CON in previous years.

In addition to an overlay mesh network, Nebula gives us certificate-based authentication and encryption using the Noise Protocol, allows us to use [preferred ranges](https://nebula.defined.net/docs/config/preferred-ranges/) for hints about which underlay IP addresses to use, and can be used to [relay](https://nebula.defined.net/docs/config/relay/) traffic to other nodes running Nebula.

**Note:** Nebula is not fully path aware as something like SCION would be, but it gets us close enough that Nebula will probably figure out the correct path packets should flow with some massaging. Since I co-authored the NixOS module, it was also fairly easy for me to reason about how the configuration would work.

## PKCS#11 support for Nebula lands in our lap

I had been working on [nixPKCS](https://github.com/numinit/nixpkcs) for better PKCS#11 support on NixOS in general, and intended to use it to automatically create SSH keys in TPMs, or do _something_ with Nix derivation signing as an experiment for the mesh binary caches. By chance, [Jack Doan](https://github.com/slackhq/nebula/pull/1153) (who, coincidentally, was also at the Car Hacking Village) added support for this to Nebula (apparently Rivian is using it)! If the PKCS#11 provider supports P-256 key agreement, now you could keep Nebula keys in hardware keystores.

The only problem was that Nebula CA keys still could only be stored on disk, since signing is a different cryptographic operation than ECDH key agreement. So I [added support for it](https://github.com/slackhq/nebula/pull/1153#issuecomment-2205536293) and wrote an [integration test with nixPKCS](https://github.com/numinit/nixpkcs/blob/v1.1.7/nixos/tests/nebula.nix#L230). Now we could use Yubikeys to store our CA keys, and the Protectli VP2420 TPMs could store the keys used to authenticate to the Nebula overlay.

![](/img/blog/dc32-nixmesh/protectlibed.png)
> All of the equipment spread out on a bed.

We ended up all generating CA keys that we could sign certificates with as we wanted, and stored a bundle of them in the Nix config we used to provision all the Nebula hosts. So that way everyone on the overlay network could decide what devices they wanted to add if they had a trusted CA. I was running our core and auxiliary infra, so added a couple more CA certs for those sets of hosts.

**Fix Me:** Provisioning these one at a time was a pain. Having nixPKCS produce key attestation data and doing multi-level CA structures is a big TODO.

## Cloud infrastructure

The only problem with leveling up our key storage to hardware tokens was that our two cloud servers acting as Nebula lighthouses now needed a TPM to have their keys similarly protected. We decided to kick this particular can down the road and break with the "use TPMs for everything" for this one case. We had somewhat successfully used [Tornado VPS](https://tornadovps.com/) for entry and exit nodes in DEF CONs of years past, and we weren't inclined to change that.

I discovered that one of our public IP addresses assigned by Tornado was blocking UDP traffic the weekend before DEF CON, so I just switched to a new set of primary IPs. Tornado VPS has been pretty responsive to non-instance firewall issues in the past, but with no time left a bandage was more realistic.

Our two Tornado VPS nodes ran Prometheus for monitoring the systems (including Nebula, following [Xe's guide](https://xeiaso.net/blog/prometheus-grafana-loki-nixos-2020-11-20/) for getting Prometheus and Grafana going worked pretty well), Unbound DNS servers, a Dante SOCKS proxy, and a few other infrastructure services. I split them into primary and auxiliary infrastructure: the auxiliary infra ran all the core stuff like DNS, but also had things like Mattermost, Prometheus, and Gitea going.

![](/img/blog/dc32-nixmesh/grafana.png)
> Some of the stats from the Nebula exporter.

**Fix Me:** Using Tornado VPS as an internet drain makes it look like your traffic is coming from a VPS, because it is! Lots of sites have started to blocklist known VPS providers. We should think about something else for next year.

**Note:** Use a well-known port for your VPN traffic unless you want your traffic to masquerade as another service. We picked UDP ports 500 and 4500 for our VPN entry nodes, since these are ports commonly used for IPSec. Then we picked random (but deterministic) ports for all our internal nodes to avoid NAT issues, and we still ran into NAT issues. There is no silver bullet here.

## From layer 3 mesh to VPN router

Getting nftables, Kea DHCP, and Knot Resolver working was the obvious next step, since each VP2420 has four ethernet ports. We were going to use all the hardware interfaces! Our config redirected all DNS and ntp queries to localhost, which used our Nebula lighthouses as upstream DNS resolvers and stratum 2 NTP servers. It also supported a couple LAN connections, and a guest network in case anyone was brave enough to plug into someone else's router at DEF CON. With that, we had a full VPN router that could tunnel all internet traffic through Nebula, and nothing was leaking in plaintext.

**Note:** It's a little mean to clients who want to query specific internet DNS servers, but redirecting DNS and NTP traffic means it doesn't leak and someone can have DNS or NTP misconfigured, still get to the right hosts, and have the correct time. If you're an ISP, maybe don't do this. If you're operating a small or medium network, it may be a good idea.

**Fix Me:** Why not [nixos-router](https://github.com/chayleaf/nixos-router)? No reasons, other than we already had configs for Kea, Knot, and nftables that predate it. Some of this stuff should be contributed, though, and maybe we should use systemd-networkd too. Either way, the router and nftables was the single most hacky part of this whole config.

**Fix Me:** Android support for Nebula is currently not ideal, though it will likely improve for next year. P-256 keys weren't supported and wouldn't use the hardware keystore anyway, so any mobile devices that wanted to connect could just do so through a USB ethernet dongle. Maybe we'll run wifi APs with WPA3-SAE next year on each mesh node too.

**Fix Me:** We should set up VRFs or source-based routing from client traffic so we don't have to compute a special routing table that notches out traffic to VPN endpoints. This likely frustrates routing to other VPN nodes that aren't on the same ethernet segment. This may also require a config schema change to Nebula so unsafe_routes can be added on routing tables other than the default.

## From VPN router to Nix binary mesh

This is where all the wisdom for setting this project up went out the window, because there are few (if any) reports of people doing this successfully.

Our "solution" (more like a hack) was setting up nix-serve and nix with a config that looked like this:

```nix
{
    nix.settings = {
        builders-use-substitutes = true;
        keep-going = true;
        download-attempts = 2;
        fallback = true;
        connect-timeout = 3;
        substituters = [ "http://10.69.1.1" "http://10.69.1.2" "http://10.69.1.3" ];
    }
}
```

If you've got some experience with Nix, you can probably instantly tell that this is not ideal for what we're trying to do.

To explain a little further, we need a couple definitions: binary cache servers can be some combination of _trusted_ and _stationary_.

A _trusted_ node is a node that you trust to serve you or build a derivation. A node is _ultimately trusted_ if you'd accept builds or substitution from this node, and _transitively trusted_ if you'd accept substitution of ultimately trusted builds from this node.

A _stationary_ node is guaranteed to be up most of the time. Think a VPS, a rackmounted server somewhere, or something that's functioning as a Nebula lighthouse.

I think our solution, as implemented, doesn't work if any node serving binary caches in the network is _untrusted_, and only partially works if any are _nonstationary_. It would require Nix changes to fix the _nonstationary_ part, and cache server changes to fix the _untrusted_ part.

## Redoing Our Config Instead Of Trusting Trust

Starting with _untrusted_: as it turns out, each mesh node is _re-signing_ builds from a more trusted builder like Hydra due to this code in nix-serve:

```perl
if (defined $secretKey) {
    my $fingerprint = fingerprintPath($storePath, $narHash, $narSize, $refs);
    my $sig = signString($secretKey, $fingerprint);
    $res .= "Sig: $sig\n";
} elsif (defined $sigs) {
    $res .= join("", map { "Sig: $_\n" } @$sigs);
}
```

A better solution is not providing a cache signing key so we just pick the signatures from Hydra in the `ValidPaths` Nix SQLite table, or using an entirely different cache server that hooks into the store layer and is a little more intelligent than `nix-serve`. If we do that, we should be able to pull down NARs that were signed by Hydra from other untrusted cache servers, like other mesh nodes.

**Note:** PKCS#11 signing and secure boot could increase the trustworthiness of nodes whose only purpose is building. Supporting ECDSA or other algorithms exclusively supported by hardware tokens would require a backwards-compatible change to the signature format in the narinfo, but would benefit ideas like [Rebuilding Builders Instead Of Trusting Trust](https://youtube.com/watch?v=UlJUpUQc9Lc) that can attest to the signing key in the narinfo's signature.

## We're still stuck with the ordering of substituters

Our solution to get around other nodes we can substitute from going away was to add a short substituter timeout, because that's the best we could do given that Nix tries them sequentially. The UX is great if all the nodes are there, but with nodes going away, running out of battery, or anything else, the substitution takes a while until it times out and tries Hydra.

**Fix Me:** The change to Nix required to avoid this kind of head-of-line blocking is decidedly more straightforward than supporting more exotic narinfo signing algorithms: we just race them in parallel, and pick the first one that we can both connect to and gives us a NAR that we trust. If we can configure individual substituters this way, we can establish different "strata" of caches to try. Try these, then try these others, then these others, and so on, until we get a trusted derivation.

## Fixing all the problems with the Nix Cache Proxy Server

Enter [ncps](https://github.com/kalbasit/ncps), a server that supports passthrough proxying of NixOS binary caches. It can try all the upstream caches at once, avoid signing narinfos, and even performs read-through caching outside the Nix store. With ZFS deduplication, you can even put it on the same device as the Nix store itself, and it won't use any additional space.

## Packaging it all up

Physically, we used backpacks. From a NixOS standpoint, we had our own internal repos that eventually got extracted into [MeshOS](https://github.com/numinit/MeshOS).

![](/img/blog/dc32-nixmesh/protectlibp.png)
> Yes, the inside of the backpack got hot, but never thermal shutdown level.

If we had to do the backpack thing again, we'd get RF cables. Hard antenna connectors and soft fabric don't really mix that well. We probably should have a good box of antennas too, the second time I brought the backpack to SCaLE 22x the antennas got nearly destroyed.

## Looking forward

This setup will return at Nix Vegas 2025, with more central caching and build support. Hopefully we'll have a way to bootstrap cheap machines using the mesh binary caches as well, with a limited amount of free hardware that attendees can use to get started with NixOS. Stay tuned!

And, if you read this far, here's the talk from Planet Nix too:

<div class="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/a2NeKtDCWhw" title="" frameBorder="0"   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"  allowFullScreen></iframe></div>

> Demo of [MeshOS](https://github.com/MeshOS)

