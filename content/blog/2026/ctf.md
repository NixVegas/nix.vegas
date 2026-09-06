---
template: "blog_post.html"
title: "Nix Vegas 2026 and the First Nix CTF"
authors: ["Chris Ertel", "Nix Vegas CTF Team"]
description: "Behind the scenes of the first-ever Nix CTF."
date: "2026-09-01"
---

Nix Vegas 2026 had the world's first Nix CTF, and a lot of neat things went into it.

## Nix Vegas 2025: The Year We (Almost) Had a CTF

For our first year, I'd come up with the idea of wanting to have a CTF. Given how shorthanded we were, I owned that project, and worked hard to make it happen.

Our theme was "Rebuild the World" and armed with the sick Nix Yggdrasil from [Kenz](https://www.instagram.com/kenz_tobias_art) and my usual stack I figured I could get something together in time.

### The goal

I set out to make a Jeopardy-style CTF: a bunch of challenges, grouped thematically, and the team with the most points wins. Morgan, some friends, and I had done [CSAW](https://csaw.io/) some years prior and it seemed like a good model to follow: something for everybody on a team. So, we'd take the Nix snowflake, chop it into nodes, and make each arm a grouping of something--basic Nix, adversarial Nix, etc.

In terms of UX, I fondly remember OverTheWire's [Bandit](https://overthewire.org/wargames/bandit/), where you are given an escalating series of missions with a brief guidance blurb (where appropriate) and links to relevant utilities. To support that--and to maximally use Nix--it made sense to spin up a VM and then stuff it with the appropriate keys (and give those keys to the user).

### The attempt

I started the project in earnest in late July (much to the chagrin of my teammates, who were pinned down getting things like the Nix Cache and streaming setup sorted out).

My high-level architecture was straightforward (we'll go into the details later):

* An Elixir control plane that hosts the web interface, handles auth, and puppets the VMs
* VM instances spun up per-attempt using qemu (Morgan had suggested using the [NixOS test infra](https://nixos.org/manual/nixos/stable/#sec-calling-nixos-tests) for this, but I decided against it because I had no idea how it worked)
* Nix flakes for the VM images

I knew I wanted a collection of VMs that people could log into over SSH and Do Nix Stuff (tm), I knew that I wanted the challenges to involve Nix, and I knew that I wanted to use Elixir with LiveView as the control plane. I had a vague idea that somehow in two weeks these ingredients would come together and magic would happen.

That would totally be enough, right?

...right?


### The results
{{ smart_image(
    src="/img/blog/2026-ctf/2025_ctf_initial_commit.png",
    alt="Picture of first commit, dated July 23, 2025.",
    caption="Why yes, anything is possible in two weeks.") }}

{{ smart_image(
    src="/img/blog/2026-ctf/2025_ctf_landing.png",
    alt="Web page showing the landing page for the CTF at Nix Vegas.",
    caption="A sweet landing page.") }}

{{ smart_image(
    src="/img/blog/2026-ctf/2025_ctf_dashboard.png",
    alt="Web page showing the CTF dashboard, including the Nix flake-as-progress-indicator.",
    caption="Manually chopping up this SVG for use as a progress tracker ate a few nights.") }}

{{ smart_image(
    src="/img/blog/2026-ctf/2025_ctf_challenge_1.png",
    alt="Web page showing the CTF first challenge, with flag capture at bottom.",
    caption="This is about as far as I got--a functioning test that you claim a flag.") }}

My ambition overstepped my capability, and so I failed to get the CTF to a workable state in time. At a DEF CON dance party I was able to finally get a VM to provision (hackily), but by that point it was too late to do anything but [enjoy the show](https://media.defcon.org/DEF%20CON%2033/DEF%20CON%2033%20music/DEF%20CON%2033%20Live%20Music%20-%20video/).

The actual Nix Community went *great*--though we had the expected teething issues (almost all addressed this year and written about elsewhere!)--and afterwards I shelved the CTF repo knowing that I'd come back and fix it up.

## Nix Vegas 2026: We Actually Did It!

For our second year, I knew I needed to actually plan ahead. We had some more great folks joining and showing interest (Jason would prove invaluable in this regard), and so on 2026-03-22 the first post in our CTF discussion channel was seeded with the repo to the past year's attempt. We were going to take our time and get things right.

### The (refined) goal

The core goal of the CTF hadn't changed much, and that helped:

> crertel: We need 24 challenges (using the 4 in the current 6 categories approach). Most are pretty straightforward evolutions, I think.
>
> crertel: Current categories are basic nix, advanced nix, nix ecosystem, deployment with nixos, hacking with nixos, secure nixos.
>
> crertel: I think the challenges should skew mostly towards the beginner end, highlighting what makes Nix/NixOS easy to use (well, sorta). Then, a few flags to let more experienced folks stretch their legs.

It wouldn't come to me until later, but the condensed problem statement is:

> You have a spectrum with cybersec folks on one side and nix folks on the other, and the CTF should have challenges that move each side towards the other.

In addition, there were things we wanted to accomplish that hadn't happened the previous year:

* The CTF challenges should all exist and work (obviously)
* The challenges should sometimes require multiple machines
* The leaderboard should track progress over time and be visible
* We should be able to access a cache of all of nixpkgs while on-site
* We should have challenges that are both technical and social
* **We should get started more than a couple of weeks before the con**

### The (improved) attempt

On April 18th I landed a bunch of code and got the first fully-functioning end-to-end version working (including port assignment, VM baking, and so forth) based on the 2025 attempt. The bones were in place, it was alive!

{{ smart_image(
    src="/img/blog/2026-ctf/2026_dev_first_challenge.png",
    alt="Screenshot of entering and completing the first challenge.",
    caption="The first challenge, with me derping around--BUT IT WORKED!") }}


Even with this progress, though, I'd failed to execute by myself the year prior and figuring out how to make enough room for other folks to get their ideas in was going to be the difference between having to carry it myself (with the risk that entails) and having a fun project with less risk that more people could be proud of.

{{ smart_image(
    src="/img/blog/2026-ctf/2026_jason_first_meeting.png",
    alt="Screenshot of exchange organizing first CTF meeting.",
    caption="If you want to go fast, go alone. If you want to go far, go with friends.") }}

During that first meeting, I laid out the basic vision and what I felt willing to compromise on (challenge specifics, formatting, etc.) and what I wanted to try and keep the same (basic tech stack, basic grouped approach to challenges/curriculum). The last bit was feeling out how comfortable Jason was with AI--I'd been an early adopter years prior but some folks in the Nix community are not comfortable using it. Jason luckily was very much in a compatible camp and so we found ourselves substantially aligned on all details and could start grinding.

The first thing we did (after sharing the repo and getting Jason admin privileges) was to open an issue to go through the high-level tracks I'd thought about and then open the floor to actual discussion and brainstorming.

{{ smart_image(
    src="/img/blog/2026-ctf/2026_gh_1_brainstorming.png",
    alt="Screenshot of first issue on CTF repo, laying out general categories of challenges.",
    caption="Engineering leadership trick one: make a coloring book, not a sketch, and your team will surprise you.") }}

Jason and I then went through and pitched our own ideas of challenges, and then kinda picked-and-chose which ones we really liked. Within a couple of weeks (June 10th), Jason had posted a PR to knock out the remainder of the Basic Nix category (following the template from the initial test challenge I'd built the framework vertical slice on), and that got us rolling with our basic pattern for the first half or so of challenges: Jason grabs a chunk of the challenges from the overview and implements them, I run them through manual PR and give feedback, we ship. I'm a strong proponent of optimistic merging and that let us cover tremendous ground in short order.

{{ smart_image(
    src="/img/blog/2026-ctf/2026_gh_jason_on_elixir.png",
    alt="Screenshot of PR comment where Jason is giving a trip report on Elixir.",
    caption="This is an accurate depiction of the Elixir Experience for many newcomers.") }}

By June 17th Jason had landed the Advanced Nix track, and I was fighting with VM building and moving the Oban jobs over to make better use of Nix. The rest of June would be Jason wrapping the Deployment with Nix track (finally landing on July 8th) and me doing other tweaks (the VM work, scrapping the snowflake progress indicator, etc.)

July is where more of the fit-and-finish and admin work happened. We landed a bunch of admin tooling for teams and VMs so that, during the event, we could reset challenges and fix things that had inevitably gone wrong (foreshadowing...). We also also landed the leaderboard graph (which turned out to be broken during the event due to silly reasons) and got the whole thing setup as a NixOS module that could be deployed on actual CTF server hardware. We also did a bunch of reworking of the network stack (more on that later) so that we could support the on-site `cache.nixos.lv`. We added support for no-VM challenges (important for the Ecosystem and, later, Recon tracks). The biggest thing that landed was support for attempt clusters (so a challenge could use multiple VMs). The very last thing that landed that month was the Erinyes track that Morgan contributed, which is basically a shop of horrors of kernel exploits lovingly packaged into reproducible Nix flakes.

One thing that was important in July was the creation of a proper set of project milestones and child issues. Normally this wouldn't be super useful, but when you have four folks working sporadically and *especially* when using LLMs to help, having a place where basic task definitions and progress are being tracked is immensely helpful. A happy discovery we made was that both Claude and Codex are more than happy to follow and do book-keeping on those boards (we used Github Projects) and this kinda kept everybody aligned and productive.

{{ smart_image(
    src="/img/blog/2026-ctf/2026_gh_2_project_management.png",
    alt="Screenshot of Github Project swimlanes for the CTF.",
    caption="Sometimes, when everybody is stressed, it's good to have a map.") }}

The last week, the beginning of August, was a mad dash to finish the last few tracks (Hacking with Nix, Recon, Social Engineering) as well as a pile of fixes. I added a CTF helper script for the challenges (`tldr` with some wrapping), an offline manual (more on that later) to help CTF staff, and ripped out a challenge that I couldn't get working at all (which made me very sad! it was cool!). Tristan landed a bunch of fixes and we bumped deps, and the last major thing was a "de-design" pass to basically remove all the old art and styling and get us back to a plain-looking web app (not pretty by any stretch, but something we wouldn't be ashamed to have people use).

### The (successful!!!) result

{{ smart_image(
    src="/img/blog/2026-ctf/2026_ctf_1_leaderboard.png",
    alt="Screenshot of the leaderboard at the end of the CTF.",
    caption="30 participants at least--feels like a success. :)") }}

We ran the CTF and people sat down around our table or connected via wifi (or logged-in after hours via the uplink...) and went after the challenges.

Selected neat things:


* One person (the eventual first-place participant) worked basically *all* DEF CON on the challenge, pinging us and trying to figure out if he was doing things correctly. As with most CTFs, the answer is basically always "Figuring that out is part of the point". That's dedication!
* The on-site cache worked *amazingly well*. People were able to pull in whatever they needed during the challenges without dealing with the weirdness of the DEF CON wifi environment (we had hardwired access as well as our own APs).
* One of the participants was a Mystery Person for almost the entire CTF. They stayed in the top 3 basically the whole time, and a frequent question was "Who is $X?".
* The manual which had solves and hints for each challenge got actual use!
* The emergency admin tooling for VM and challenge resetting got actual use!

Some stumbles:
* We had a little bit of a snag with routing and DNS (requiring us to roll the VMs), but that got fixed within an hour or two.
* Due to a bug in how we handled bundling in "production", the pretty chart for the leaderboard never rendered--just the table.
* One of the challenges involved the Discourse and trying to get folks involved in the community--basically, register an account and message us. Unfortunately, the trust level for new users is so low that they couldn't complete it, requiring admin verification and intervention (another victory for the admin tooling).
* Prior to the con, we'd tried to stuff a flag into another community space, and got in trouble.

**Overall, though, the CTF went off cleanly!**

VMs spun up, people did challenges, the challenges almost all worked, and nobody got super mad at us. It was the vindication of a lot of hard work over the year, a marked improvement over my own attempt the year prior, and a strong foundation for the next version of things.

## Technical details

The success of the CTF relied on some rather neat infrastructure and networking just as much as it did on neat usage of Phoenix and qemu.

### Infrastructure

*Nix Vegas CTF in tres partes divisa est.*

We had: the user access plane, the network edge, and the CTF compute core.

{{ smart_image(
    src="/img/blog/2026-ctf/2026_ctf_infra.png",
    alt="Block diagram of the Nix Vegas infrastructure, showing networking, hosts, and services.",
    caption="Every good CTF needs a bunch of boxes and wires.") }}

You might be wondering: "Why did you all bring so much of the stack on-site?"

The thing you have to understand, and it won't make sense until you experience it viscerally, is just *how bad* the DEF CON networking environment is. To quote the DEF CON NOC [about page](https://noc.defcon.org/about/):

> It would be fair to describe the network as "hostile". It has been described as 'the worlds most hostile
> network,' but such descriptions are just attempts at flattery.

The reasons for this are:

* Large numbers of attendees using the network at the same time--about [26K](https://media.defcon.org/DEF%20CON%2034/) this year.
* Attendees that are largely technical, and almost all explicitly security-focused and exploring.
* Wide deployment of rogue APs, networking pentesting tooling, red-team tools for things like deauth attacks, etc.

(It is said that these days it's sort of safe, and that "nobody is gonna burn a 0-day at DEF CON". Increasing usage of LLMs and AI tooling for automatic vulnerability discovery and exploitation will doubtless change that arithmetic.)

Nix is somewhat notorious for its storage and bandwidth usage. Doing a `nixos-rebuild` over that network environment is asking for disaster. So, we owned our own uplinks and backhauls, using [Nebula](https://github.com/slackhq/nebula) for tunneling, and then ran our own cache and APs and hardlines for attendees in our space.

We of course had a [flake](https://github.com/NixVegas/dcwifi) for making our wifi onboarding simpler for NixOS users, and [instructions](https://nixos.lv/2026/onsite/) for folks onsite on the different things available--fully on-site copies of nixpkgs (unstable and 26.05, binary cache and source), NixOS ISOs, a PXE boot for the bold, the manual, a search interface for nixpkgs, the live steam, the CTF, and other goodies. This was all an extension of the work done [last year](https://nix.vegas/blog/2025/2025-retrospective/#noc), but with polish and lessons-learned.

(Fun thing that happened: at least one person came up to me and said "Yeah, I installed NixOS a couple weeks ago because I heard you people would be here and I could download whatever tools I needed for my other CTFs at DEF CON". Nixpkgs is a force-multiplier for blue-team and red-team CTFs!)

The actual machine at the core of it--`citadel`--was a [Tenstorrent TT-QuietBox](https://tenstorrent.com/en/hardware/tt-quietbox) with 512 GB ram and a 16c/32t Epyc 8124. This machine was augmented by a small fleet of Protectlis: our main gateway VP6670--`ghostgate`--and ideally three helper VP2420s--`ayem`, `seht`, and `vehk`--responsible for being APs and pluggable switches. `seht` stayed home this year though. We also had some powerline ethernet adapters, but they acted up.


### The CTF Software

The infrastructure was really cool, but to make the most of it, we had to of course actually host a CTF stack.


#### Features and design space

The design space for the CTF was:


* Elixir/Phoenix/Liveview as backplane (no real client-side JS, nice story for updates and pub/sub stuff)
* qemu for hosting the actual challenge attempts
* single SSH port per attempt, anything more interesting users can use SSH [SOCKS](https://en.wikipedia.org/wiki/SOCKS)
* Shared team account (no individual users)
* Basic leaderboards
* Relatively self-contained challenges with a common lifecycle
* Challenge attempt images built with nix
* Access to an on-site cache

That was the basic shape of it in 2025; in 2026, we refined this a bit and feature-crept additional functionality with the power of clankers:

* Deployable as a NixOS module
* Per-attempt flags baked into images
* Shared base images (instead of one-offs)
* Good admin tooling for teams, VMs, challenges for on-site admin intervention
* On-site manual with solutions and guidance for each challenge
* Support for partial captures (some challenges have multiple solutions, we want to reward the nixiest ones)
* Support for 0-VM challenges (used for social engineering, recon, and ecosystem challenges)
* Support for N-VM challenges (challenge attempt becomes a cluster of VMs, with one the user has access to)
* Support for automatic port pooling and assignment (where I got stuck and gave up at the party in 2025)
* API for an activity feed
* Support for an audit log of events
* Redeemable tokens for off-site participation
* New challenge track: recon (find the flag in various places)
* New challenge track: kernel exploits

#### What teams experienced

After registering, a user would be given the list of available challenges:

{{ smart_image(
    src="/img/blog/2026-ctf/2026_ctf_2_dashboard.png",
    alt="Screenshot of a typical team dashboard, showing available challenges.",
    caption="The list of challenges that greeted new teams. Simple but effective.") }}

Once chosen, they are given the challenge screen:

{{ smart_image(
    src="/img/blog/2026-ctf/2026_ctf_3_starting_challenge.png",
    alt="Screenshot of the first challenge.",
    caption="The first challenge, basically just a tutorial level to spin up, log in, and cap a flag.") }}

They'd click the begin button, and after provisioning completed (usually within a few seconds), they'd be given the final instructions:

{{ smart_image(
    src="/img/blog/2026-ctf/2026_ctf_4_challenge_provisioned.png",
    alt="Screenshot of the first challenge's provisioned information.",
    caption="The first challenge, now provisioned, displays a private key, login instructions, a flag input form, and self-serve options.") }}

Teams would log into the instance, complete the challenge (perhaps using the `ctf-help` command to access a description of the challenge and get `tldr`-powered command reference/assistance), and then input their flag and (hopefully) capture its points. Rinse and repeat unto glory!

#### The lifecycle of a challenge attempt

Breaking that workflow down a bit, the actual lifecycle was rather more involved. A simplified version--omitting our logic for checking for things like the CTF being active, the team having exceeded concurrent VM/challenge quota, and so forth--looks like this:

1. User selects a challenge and hits start.
2. A new challenge attempt is instantiated with status `provisioning`, including keys and flags.
3. An [Oban](https://github.com/oban-bg/oban) (the Elixir community's standard for work queueing) job is created with the challenge attempt ID and pubkey (we could've attached this to the challenge attempt...next year goals!).
4. The job is picked up and provisioning attempted.
  1. if it is already in-progress or needs no VM, we mark it as good to go.
  2. attempt to checkout a port, bail out if at capacity.
  3. generate the seed/flag for the challenge
  4. finally, use the challenge-specific callback to create the attempt instance--probably by using `CtfUtils.VMUtils.start_cluster` to pass along the VM definitions, cluster settings, seed, pubkey, and relevant files.
5. User LiveView process gets the update that the challenge is ready, and displays the connection information.
6. User completes challenge and submits flag.
  1. If flag is incorrect, notify user and leave everything alone.
  2. Flag was correct, so score the attempt (this allows for multiple flags) using the challenge-provided value.
  3. Schedule a deprovisioning job.

The main trick to all of this was separating out the core logic of the CTF--creating a challenge, tracking progress, orchestrating infrastructure, and so forth--with the *challenge-specific* logic--scoring, player information, attempt-specific flags and files. Key to this was the use of two Elixir features: [protocols](https://elixir.hexdocs.pm/1.20.4/protocols.html#protocols-and-structs) and [behaviours](https://elixir.hexdocs.pm/1.20.4/typespecs.html#behaviours)--the latter allows us to dictate the functions that a module must expose if it is compliant, and the former allows us to define those functions in such a way that callers have no idea about their specifics. Such is scalable software organization in the functional actor language of Elixir.

For a simple challenge, this means we have an almost declarative way of constructing a challenge:

```elixir
defmodule CtfServer.Challenges.BasicNix1 do
  @behaviour CtfServer.ChallengeBehavior
  defstruct []

  def group, do: "basic-nix"
  def level, do: 1
  def max_score, do: 100
  def name, do: "Your First Nix Expression"

  def vm_base_config do
    :ctf_server
    |> :code.priv_dir()
    |> Path.join("challenges/basic_nix_1/vm.nix")
    |> File.read!()
  end

  def description,
    do: """
    # Your First Nix Expression

    This challenge will get you familiar with logging into a CTF machine, running a basic nix expression, and capturing a flag.

    ## The task

    On your challenge VM, you'll find a file at `~/challenge.txt`. Your goal is to compute the SHA-256 hash of its contents using Nix builtins, and submit the result as your flag.

    ## Hints

    * You can start an interactive Nix REPL with `nix repl`. Type `:?` for help once inside.
    * Check out [builtins.hashString](https://nix.dev/manual/nix/2.28/language/builtins.html#builtins-hashString) and [builtins.readFile](https://nix.dev/manual/nix/2.28/language/builtins.html#builtins-readFile).
    * You can also evaluate expressions directly from the command line: `nix eval --expr '<expression>'`
    * The flag format is `Nix{<hash>}`.
    """

  defimpl CtfServer.Challenge do
    alias CtfServer.Accounts.Team

    def name(_challenge), do: @for.name()
    def description(_challenge), do: @for.description()
    def group(_challenge), do: @for.group()
    def level(_challenge), do: @for.level()
    def max_score(_challenge), do: @for.max_score()

    def create_flag(_challenge, %Team{} = team) do
      seed = @for.generate_seed(team)
      hash = :crypto.hash(:sha256, seed) |> Base.encode16(case: :lower)
      {:ok, hash}
    end

    def instantiate_challenge_attempt(challenge, attempt, pubkey) do
      seed = @for.generate_seed(attempt.team)

      CtfUtils.VMUtils.start_cluster(attempt, [
        %{
          role: "main",
          ingress?: true,
          base_image: "basic-nix_1.qcow2",
          domain_template:
            :ctf_server
            |> :code.priv_dir()
            |> Path.join("challenges/basic_nix_1/domain.xml.eex"),
          files:
            [
              {"/home/ctf/.ssh/authorized_keys", pubkey},
              {"/home/ctf/challenge.txt", seed}
            ] ++ CtfServer.ChallengeBanner.login_files(challenge)
        }
      ])
    end

    def cleanup_challenge_attempt(_challenge, attempt) do
      CtfUtils.VMUtils.teardown_cluster(attempt)
    end

    def score_challenge_attempt(challenge, %Team{} = team, flag) do
      expected_hash =
        :crypto.hash(:sha256, @for.generate_seed(team)) |> Base.encode16(case: :lower)

      if flag == expected_hash do
        {:ok, max_score(challenge)}
      else
        {:error, "Wrong flag."}
      end
    end
  end

  @doc false
  def generate_seed(%CtfServer.Accounts.Team{} = team) do
    CtfServer.Flag.seed("basic-nix-1", team)
    |> Base.encode16(case: :lower)
    |> binary_part(0, 16)
  end
end
```

The interesting takeaways here are:

* The important parts of the lifecycle--creation, seed generation, scoring--are all challenge-specific.
* We make heavy use of helper functions (that `start_cluster` probably looks suspicious!) to keep the challenge definition small and readable.
* A challenge is perfectly free to create one or many VMs--or none at all!--and have a unique flag per team, per attempt, or static for the entire challenge (useful if you want to encourage collaboration).

That domain XML file is the actual description for the machine, with some points for EEx to interpolate in:

```xml
<domain type="kvm">
  <name><%= domain_name %></name>
  <metadata>
    <ctf:hook xmlns:ctf="https://nixc.tf/xmlns/qemu-hook/1" ssh-port="<%= ssh_port %>" guest-ip="<%= guest_ip %>"/>
  </metadata>
  <memory unit="MiB">1024</memory>
  <vcpu>1</vcpu>
  <%= os_block %>
  <%= cpu_block %>
  <devices>
    <disk type="file" device="disk">
      <driver name="qemu" type="qcow2"/>
      <source file="<%= image_path %>"/>
      <target dev="vda" bus="virtio"/>
    </disk>
    <interface type="network">
      <source network="<%= network_name %>"/>
      <mac address="<%= guest_mac %>"/>
      <model type="virtio"/>
      <filterref filter='ctf-egress'>
        <parameter name='GATEWAY' value='<%= gateway_ip %>'/>
        <parameter name='SUBNET' value='<%= subnet %>'/>
      </filterref>
    </interface>
    <serial type="pty"/>
    <console type="pty"/>
  </devices>
</domain>
```

Again, note that we have the ability to give challenges highly customized nodes:

* Precise disk and RAM (important for certain challenges that might need more for building)
* Custom hooks for network trickery (that `ctf:hook`)
* Custom NICs and `<filterref>`s that govern what networks the VM can see (for example, the internet as a whole, the cache we were running on `citadel`, and/or the isolated network a challenge might have if multi-node)

But, this is Nix Vegas! *Where is the nix?!*

I'll skip over a lot of the moving parts--you'll want to refer to `lib/ctf_utils/vm_utils.ex` in the code drop!--but the nix that we use as a base is quite straightforward (except for one thing I'll point at):

```nix
# Shared base configuration across every challenge VM.
#
# This is the block that used to be copy-pasted into every
# priv/challenges/<name>/vm.nix: the qemu-guest profile, the other common
# modules (help/boot/cache), root filesystem, SSH access, the standard
# package set, and the `ctf` user. A challenge vm.nix imports this and adds
# only whatever is specific to that challenge (e.g. offline build warmups).
{
  config,
  pkgs,
  lib,
  modulesPath,
  ...
}:
{
  imports = [
    (modulesPath + "/profiles/qemu-guest.nix")
    ./help.nix
    ./boot.nix
    ./cache.nix
    ./cluster-hosts.nix
  ];

  # Disk image settings. The built base image is deliberately small, but each
  # per-attempt overlay is created with a much larger virtual disk (see
  # CtfUtils.VMUtils.create_overlay). Grow the root partition and its ext4 fs to
  # fill that disk at boot so a challenge fetch/build has real headroom instead
  # of running out on the base image's tight free space.
  boot.growPartition = true;
  fileSystems."/" = {
    device = "/dev/vda1";
    fsType = "ext4";
    autoResize = true;
  };

  # Basic system
  system.stateVersion = "26.05";
  nix.settings.experimental-features = [
    "nix-command"
    "flakes"
  ];

  # Point <nixpkgs> at the source that built this image, and resolve the
  # `nixpkgs` flake reference to the same local source, so challenges can
  # resolve nixpkgs without network access inside the offline VM.
  nix.nixPath = [ "nixpkgs=${pkgs.path}" ];
  nix.registry.nixpkgs.to = {
    type = "path";
    path = "${pkgs.path}";
  };

  # SSH access — authorized keys injected per-attempt via guestfish
  services.openssh = {
    enable = true;
    settings = {
      PermitRootLogin = "prohibit-password";
      PasswordAuthentication = false;
    };
  };

  # Give them some useful tools.
  environment.systemPackages = with pkgs; [
    nix
    vim
    curl
    git
    htop
    tmux
    nmap
    rogue
  ];

  users.users.ctf = {
    isNormalUser = true;
    home = "/home/ctf";
    extraGroups = [ "wheel" ];
    openssh.authorizedKeys.keys = [ ]; # injected per-attempt
  };
}
```

If you're not skimming this too hard, you might catch that `CtfUtils.VMUtils.create_overlay` bit. What's an overlay?

Well, in the 2025 version, the goal was going to be to build a fresh image from scratch every time for every team, which was slow and took minutes. Bad bad bad. What we really want is a common image, and then per-attempt overwrites to fill in things like team seeds, files, or whatever.

The solution to this is to (at challenge provisioning time):

1. (pre-game) Create the base image as an offline job (see `lib/mix/tasks/ctf.build_vm_bases.ex`) using `nix build`
2. Create a qcow2 overlay using `qemu-img` that is a copy-on-write view of the base image (so we can scribble on it without hurting anybody else)
3. Inject the attempt-specific files via [guestfish](https://libguestfs.org/guestfish.1.html)
4. Boot the VM

There are several other steps--the networking itself took a lot of iteration, missteps using [Slirp](https://en.wikipedia.org/wiki/Slirp), and some fiddling to make a virtual network "pretend" to be wired/hubbish so that MITM/wireshark attacks could work--but a lot of that probably wants to be in its own infra post or is boring stuff like provisioning that you can glean from the source drop if curious.

#### A fun side-effect of using nix

One thing that came out of this that was super useful is the large degree to which nix itself helped with the challenge development.

Phoenix and LiveView meant that the user interface and control-plane stuff was basically not remarkable...but nix gave us two superpowers that we did not entirely expect.

First, the use of nix to build the VMs meant that I could chuck my hacky build pipeline (built with Mix and Oban, and the less said about it the better) and instead have something that Just Worked (tm). Critically, Just Worked (tm) meant that it wouldn't rebuild images that didn't actually change run to run, and it meant that I could farm out builds to my large workstations without any additional work (my own NixOS config for normal use had them as [builders](https://heitorpb.github.io/bla/wonders-of-nix-remote-builders/)). My CTF rebuilds just ran fast as each challenge got locked in.

Second, though, we inherited a really neat feature of how NixOS package development is done. Let me just share a code snippet to show what we had going, from one of our fiddlier challenges (`nixos/tests/ctf-server-capture-the-poll.nix`):

```nix
testers.runNixOSTest {
  name = "ctf-server-capture-the-poll";

  nodes.noc =
    { ... }:
    {
      imports = [ self.nixosModules.ctf-server ];

      services.ctf-server = {
        enable = true;
        package = ctfServerPackage;
        vmBaseImagesPackage = captureImagePackage;
        host = "localhost";
        port = 4000;
        vmPortRange = {
          from = 2201;
          to = 2201;
        };
      };

      environment.systemPackages = [
        pkgs.curl
        pkgs.coreutils
        pkgs.gnugrep
        pkgs.gnused
        pkgs.postgresql
        pkgs.openssh
        ctfEval
        ctfRegisterTeam
        ctfStartCapture
        ctfAttemptStatus
        ctfDumpProvisioningState
        ctfWaitStarted
        ctfWriteAttemptSsh
        ctfExpectedFlag
      ];

      # Three nested KVM guests per attempt — give the noc room.
      virtualisation = {
        cores = 4;
        diskSize = 16384;
        memorySize = 8192;
        qemu.options = [
          "-cpu"
          "host"
        ];
      };
    };

  testScript = ''
    start_all()

    noc.wait_for_unit("postgresql.service")
    noc.wait_for_unit("libvirtd.service")
    noc.wait_for_unit("ctf-server.service")
    noc.wait_for_open_port(4000)
    noc.wait_until_succeeds("curl --fail --silent --show-error --max-time 10 http://localhost:4000/")

    # All three per-role images are linked into the runtime image dir.
    noc.succeed("test -L /var/lib/ctf-server/vm-bases/capture-the-poll_1_web.qcow2")
    noc.succeed("test -L /var/lib/ctf-server/vm-bases/capture-the-poll_1_poller.qcow2")
    noc.succeed("test -L /var/lib/ctf-server/vm-bases/capture-the-poll_1_ingress.qcow2")

    noc.succeed("ctf-register-team")
    noc.succeed("ctf-start-capture")
    noc.succeed("ctf-wait-started")
    noc.succeed("ctf-write-attempt-ssh")

    # The cluster stands up three domains and one network for the attempt.
    domains = noc.succeed("${virsh} -c qemu:///system list --name | grep '^ctf-vm-' | sort").splitlines()
    print("cluster domains:", domains)
    assert len(domains) == 3, f"expected 3 cluster domains, got {domains}"
    for role in ("web", "poller", "ingress"):
        assert any(d.endswith(f"-{role}") for d in domains), f"missing {role} domain in {domains}"

    # SSH into the ingress node over the vnet and sniff the web<->poller HTTP.
    gip = noc.succeed("cat /root/ctf.ingress_ip").strip()
    ssh_opts = "-4 -i /root/ctf.key -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5"
    ssh_base = f"${ssh} {ssh_opts} ctf@{gip}"

    noc.wait_until_succeeds(f"{ssh_base} true", timeout=240)

    captured = noc.succeed(f"{ssh_base} 'bash -s' < ${ctfCaptureScript}").strip()
    print("captured off the wire:", captured)

    expected = noc.succeed("ctf-expected-flag").strip()
    assert captured == expected, f"captured {captured!r} != expected flag {expected!r}"
  '';
}
```

See, in nixpkgs, if you're being a good contributor, you write python scripts that will use the build environment to spin up a VM with your...whatever...on it, and do testing. This is a godsend when doing something like testing, say, [Nebula](https://github.com/NixOS/nixpkgs/blob/6713828a351efa628b025a1adf7f43cbf8597513/nixos/tests/nebula/connectivity.nix#L365) which as VPN software really wants multiple machines and weird network stuff configured for a real test.

For a good chunk of all of our challenges, we had exactly this sort of test. This meant that, for CI/smoke purposes, we could actually run the solve path for every challenge that benefitted. We didn't have it for everything, but for all the fiddly challenges we did (for example, the entire Erinyes series is tested in this fashion--if you ever want to see a CI run repro kernel exploits, we have that).

This made rapid development especially safe and effective--and remember, since tests are just another build job, the test runs were farmed out across builders as well!--and that was something both we humans and our clanker assistants very much appreciated. It also meant that when it was time to write the manual, we had a clear guide to work off of.

### Lessons learned

Honestly, everything this year went amazingly. We did learn a few things, though, in different areas.

#### Scheduling lessons

We had a couple hiccups with development. The Slirp issue was something that I avoided dealing with because I wasn't actually working against the infra Morgan and Tristan were standing up. The builds of the base images took a lot of resources and I almost ran out of SSD space a few times (saved by judicious `nix-collect-garbage` at the last minute; [fix](https://github.com/psyclyx/fix) would also be a better choice to cut down on eval time and was used to good effect elsewhere in the infra).

Starting earlier in the year (e.g., not *two weeks before the conference!*) made everything vastly less stressful and gave everybody sufficient slack and time to schedule in work where they could when they could. Since our team was scattered across the West Coast, Texas, and East Coast, that flexibility was clutch.

Picking a couple of days that were spiritually pencils-down was helpful (even if we snuck in stuff after), and the choice to do the "de-styling" to give us a presentable base paid off when I was unable to get the lore and new art into place in time (always, always, schedule a fallback position in a project like this).

#### Communication and collaboration

Having a good place to screenshot and ask questions and show progress was important both for debugging and morale. Our systems for that were excellent, and helped even during the conference and even now as I'm combing for historical artifacts while writing this.

Saying yes to almost everything felt weird, but it was okay. It made it easier for people to get involved and stay involved when they had the time, and it meant we did a lot more than I had ever considered (just look at the scope creep this year! great stuff, *because I said yes most of the time*).

We used Github Projects to track the development of the challenges. This made it a lot easier to maintain the correct sense of what was being worked on by who, and also to track ideas and tweaks async. Some of the challenges basically had no revisions, some had a lot of feedback and a "I think we'll actually go in this other direction" moment, but all that got tracked in the comments neatly. As I'll elaborate later, it was also something where the project secretarial work was easily foisted off on the clankers ("Hey, can you please check the current status of the PRs for our basic nix track and see if that matches the board?", "Hey, did we ever come to a conclusion on...", etc.)

We're all rather senior engineers, so this was all old-hat to us, but it's always reassuring to see good habits continuing to pay off.

#### Clankers

One of the biggest differences between 2025 and 2026 was the quality of clankers. In 2025 I occasionally talked through a solution with GPT (not even Codex!) or Claude, but in 2026 they were effectively additional members of the team.

By and large, nix is now a first-class language for clankers. Elixir (again, not an accidental choice on my part here either--if you don't believe me, please sample some of my community's finest [agitprop](https://dashbit.co/blog/why-elixir-best-language-for-ai)) remains well-understood especially if you don't indulge in too much excess of macros or whatever. The understanding of network issues for qemu was imperfect, but with enough blind-flailing Claude usually got something figured out.

Remember how I'd mentioned the testing situation? Between `mix test` for the control plane and the superpowers of nix, we were able to create deterministic, reliable, and clanker-legible feedback that made them much more effective. I am unsure if this would generalize to other circumstances, but for *this project* it worked extremely well. I even ended up with a skill to have Claude kick off full test runs and verify everything else via headless browser clicking. Check the `.claude/skills` directory in the code drop for more there.

There *were* cases where the clankers sorta lost their minds. I wasted a day or two riding shotgun with Claude as it repeatedly failed to figure out what was wrong with the challenge I ultimately yanked: suffering from a misunderstanding of nix and how the build chain worked, an overloaded builder box whose suffocation appeared as a test failure, and various other things we finally had to give up and shelve it for next year. To give an idea of the problem, observe this frantic addition made to its testing skill:

```markdown
**Watch per-box concurrency — oversubscription = false timeouts.** Each challenge
test's VM is ~4 vCPU + ~10 GB; a 5950X (32 threads / 128 GB) comfortably runs
~6 concurrently, ~8 max. But `/etc/nix/machines` sets `maxJobs 12` per builder,
and nix fills builders *greedily* — so it can stack 12 heavy tests on one box
(~1.5× CPU oversubscription → the starvation that yields false timeouts). If the
builders are still at `maxJobs 12`, either lower them to ~6 for the run, or run
the checks in batches (≤ ~8 concurrent) so nothing stacks. A test log with a
postgres checkpoint `write=100 s+` means you oversubscribed — back off and re-run.

**Never run these on a resource-contended machine.** Nested KVM starves and
tests time out with *false* failures. Tell-tale in a test log: a postgres
checkpoint taking 100 s+ (`write=103 s`) where it's normally sub-second — that's
starvation, not a challenge bug. Re-run on an idle farm before believing a
timeout.
```

...you need not imagine the hours of meat and silicon wasted that ultimately produced those admonitions.

Perhaps the most interesting thing for me, development-wise, was the degree to which the clankers made me really put my money where my mouth was when it came to optimistic merging. Coming towards the end of the development window, Tristan identified a bunch of hardening changes he wanted to make. My deep-seated instinct from a past life as a principal engineer was "hell no, we're not going to risk that right now, and I sure as hell am not going to be on the hook for code I don't understand". But, thinking about it for a bit, I realized that we had tests in place, we had source control for a reason, and that even if it didn't work out the only *real* cost to either of us was a few minutes spent in discussion--it was tokens, not life force, we were spending. So, we went ahead and did it, and it was fine.

Nearly as interesting is the fact that the chosen stack was only half-understood by any of us (different halves!). I've been doing Elixir for over a decade, have used it at scale and [in anger](https://erlang-in-anger.com/), but my nix is not particularly good (better, now, but I've never put it on the critical path to my rent). The other folks on the team were much more experienced with nix, but had never touched Elixir. Clankers enabled all of us to be productive together, by bridging the language gap and reducing the amount of work spent getting each other up to speed--various questions and ideas could be explored locally with mechanical help before escalating to a subject-matter expert.

I believe that we absolutely could've done this work without clanker assistance. I also believe it would've been more stressful by an order of magnitude, and would be missing a lot of little neat touches and flourishes that that extra bandwidth unlocked.

### Future work

For next year, we have some ideas for things to try!

**More advanced game mechanics.** I think it'd be cool to make it possible for teams to help each other solve challenges or invite help in exchange for splitting points. Basically, a Souls-like coop approach to cybersecurity. It'd also be cool to be able to collect achievements, have more types of flags and wittier feedback, and so forth.

**Proper lore and styling.** I ran out of time and energy to skin our CTF to match the theme, and next year I'd like to leave a good month for going in and inserting story elements and styles and things to make it feel like a neat narrative players are joining.

**Better tests.** Every challenge, no matter how small, should have a full solve test.

**Better VM substrate.** We used qemu and qcow2. These are slow, and while they are well-understood (mostly) there are better tools. I looked at [Firecracker](https://firecracker-microvm.github.io/) and the rest of the team looked at [Cloud Hypervisor](https://www.cloudhypervisor.org/). In either case, we might also want to see if a refit to use [microvm](https://github.com/microvm-nix/microvm.nix) would be a good move.

**Non-linux challenge support.** It'd be fun to have a `mkWindows` or similar to let people kick around other operating systems. Not as nixy, but still good fun and surprisingly easy with this stack. We technically could've done that this year, but didn't.

**Better networking.** I always want better networking. More interesting use of VLANs, captive portals for the wireless, etc.

**Better on-site AI support.** We already were hosting a Qwen variant as Nixie, but it'd be neat to push that even farther and make it an in-app helper or gimmick somehow.

**Better virtual consoles.** There are a lot of things I like about the SSH approach we took, but if we also had a way of getting a [noVNC](https://novnc.com/info.html) setup for users that'd be cool. It'd be even cooler because it'd let us have styled desktops and whatnot for them to play with.

**More exciting use of ZFS.** ZFS is a great technology, and if we could use it more fully that'd be great. Making easy snapshots for participants, cheaper storage of image bases, who knows.

## Conclusion

This was an amazing year. From a failed attempt last year to a resounding success this year, the Nix Vegas CTF was a hell of a lot of fun to make and, we hope, a hell of a lot of fun to play. We hacked, we tried, we built. Thank you to everybody who came out to see us, and thank you to all of my teammates that made it actually all come together this year.

If there's one thing I do want people to take away from our experience: **nix is a powerful tool for cybersecurity, both for training and for work--it makes hard things easy, it makes easy things reliable, and it opens a whole new set of tools for both red and blue teams.**

See you all next year!

- Chris (crertel)

### **[And yes, you can build on our work yourselves.](https://github.com/NixVegas/codedrop-ctf-framework-2026)**