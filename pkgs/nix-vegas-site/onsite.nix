{
  nix-vegas-site,
  jq,
  yq,
  emptyDirectory,
  onboardingArtifacts ? emptyDirectory,
  ...
}:

nix-vegas-site.overrideAttrs (prev: {
  inherit onboardingArtifacts;
  nativeBuildInputs = prev.nativeBuildInputs or [ ] ++ [ yq jq ];
  preBuild = ''
    slurp_jq() {
      jq --raw-input --slurp '(split("\n") | map(select(. != "")))'"$*"
    }
    ln -s $onboardingArtifacts nixos
    tomlq -ti '.base_url = "https://nixos.lv/"' config.toml
    tomlq -ti '.extra.onsite = true' config.toml
    tomlq -ti ".extra.nixpkgs_rev = $({ cat nixos/rev || true; } | slurp_jq '[0] // ""')" config.toml
    tomlq -ti ".extra.nixos_version = $({ cat nixos/version || true; } | slurp_jq '[0] // ""')" config.toml
    tomlq -ti ".extra.isos = $(
      { find -L nixos/systems/ -name '*.iso' || true; } | slurp_jq
    )" config.toml
    tomlq -ti ".extra.vmas = $(
      { find -L nixos/systems/ -name '*.vma.zst' || true; } | slurp_jq
    )" config.toml
    tomlq -ti ".extra.manual = $(
      { find -L nixos/manual/ -name index.html || true; } | slurp_jq '[0] // ""'
    )" config.toml
    tomlq -ti ".extra.search = $(
      { find -L nixos/search/ -name index.html || true; } | slurp_jq '[0] // ""'
    )" config.toml
    tomlq -ti ".extra.channel = $(
      { find -L nixos/channel/ -name '*.tar.xz' || true; } | slurp_jq '[0] // ""'
    )" config.toml
    rm -f nixos

    echo "Final config.toml:" >&2
    cat config.toml >&2
  '';

  postInstall = ''
    ln -s $onboardingArtifacts $out/public/nixos
  '';
})
