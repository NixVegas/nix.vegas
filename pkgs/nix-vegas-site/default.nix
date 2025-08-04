{
  stdenv,
  zola,
  callPackage,
  ...
}@args:

stdenv.mkDerivation {
  name = "nix-vegas-site";
  src = ../..;
  buildInputs = [
    zola
  ];
  buildPhase = ''
    ls -al
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
