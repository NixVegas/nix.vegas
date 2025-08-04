{
  description = "Nix Vegas Website";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-parts.url = "github:hercules-ci/flake-parts";
    flake-compat.url = "https://flakehub.com/f/edolstra/flake-compat/1.tar.gz";
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      flake-parts,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        flake-parts.flakeModules.easyOverlay
      ];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];

      perSystem =
        {
          config,
          system,
          pkgs,
          ...
        }:
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [
              self.overlays.default
            ];
          };

          overlayAttrs = {
            nix-vegas-site = pkgs.callPackage ./pkgs/nix-vegas-site {
              inherit nixpkgs;
            };
          };

          packages = {
            default = pkgs.nix-vegas-site;
            nixVegasOffsite = pkgs.nix-vegas-site;
            nixVegasOnsite = pkgs.nix-vegas-site.onsite;
          };

          devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
              zola
              alejandra
              pngcrush
              nodePackages.svgo
              nixfmt-rfc-style
            ];
          };
        };
    };
}
