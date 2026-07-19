{
  stdenv,
  zola,
  yq,
  callPackage,
  ...
}@args:

stdenv.mkDerivation {
  name = "nix-vegas-site";
  src = ../..;
  nativeBuildInputs = [
    yq
  ];
  buildInputs = [
    zola
  ];
  # config.toml defaults onsite = true (so local/dev/preview builds show the
  # onsite pages). This is the PUBLIC offsite build, so force it back off — the
  # onsite variant (onsite.nix) overrides this preBuild and sets it true again.
  preBuild = ''
    tomlq -ti '.extra.onsite = false' config.toml
  '';
  buildPhase = ''
    runHook preBuild
    zola build --output-dir public
    runHook postBuild
  '';
  installPhase = ''
    runHook preInstall
    mkdir -p $out
    mv public $out/
    runHook postInstall
  '';
  passthru.onsite = callPackage ./onsite.nix args;
}
