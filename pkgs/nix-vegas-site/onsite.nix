{
  nix-vegas-site,
  emptyDir,
  onboardingArtifacts ? emptyDir,
  ...
}:

nix-vegas-site.overrideAttrs (prev: {
  preBuild = ''
    sed -Ei 's/^onsite\s*=\s*.+$/onsite = true/g' config.toml
  '';
})
