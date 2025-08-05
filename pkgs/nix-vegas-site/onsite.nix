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
    ln -s $onboardingArtifacts onboarding
    tomlq -ti '.extra.onsite = true' config.toml
    tomlq -ti ".extra.nixos_version = $({ cat onboarding/version || true; } | slurp_jq '[0]')" config.toml
    tomlq -ti ".extra.isos = $(
      { find -L onboarding/systems -name '*.iso' || true; } | slurp_jq
    )" config.toml
    tomlq -ti ".extra.vmas = $(
      { find -L onboarding/systems -name '*.vma.zst' || true; } | slurp_jq
    )" config.toml
    tomlq -ti ".extra.manual = $(
      { find -L onboarding/manual -name index.html || true; } | slurp_jq '[0] // ""'
    )" config.toml
    tomlq -ti ".extra.search = $(
      { find -L onboarding/search -name index.html || true; } | slurp_jq '[0] // ""'
    )" config.toml
    tomlq -ti ".extra.nixpkgs = $(
      { find -L onboarding/nixpkgs -name *.tar.gz || true; } | slurp_jq '[0] // ""'
    )" config.toml
  '';

  postInstall = ''
    ln -s $onboardingArtifacts $out/public/onboarding
  '';
})
