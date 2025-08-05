{
  nix-vegas-site,
  jq,
  yq,
  emptyDir,
  onboardingArtifacts ? emptyDir,
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
    tomlq -i '.extra.onsite = true' config.toml
    tomlq -i ".extra.nixos_version = $(cat onboarding/version | slurp_jq '[0]')"
    tomlq -i ".extra.isos = $(
      find -L onboarding/systems -name '*.iso' | slurp_jq
    )" config.toml
    tomlq -i ".extra.vmas = $(
      find -L onboarding/systems -name '*.vma.zst' | slurp_jq
    )" config.toml
    tomlq -i ".extra.manual = $(
      find -L onboarding/manual -name index.html | slurp_jq '[0]'
    )" config.toml
    tomlq -i ".extra.search = $(
      find -L onboarding/search -name index.html | slurp_jq '[0]'
    )" config.toml
    tomlq -i ".extra.nixpkgs = $(
      find -L onboarding -name *.tar.gz | slurp_jq '[0]'
    )" config.toml
  '';

  postInstall = ''
    ln -s $onboardingArtifacts $out/onboarding
  '';
})
