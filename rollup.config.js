import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "src/index.js",
    output: [
      {
        file: "dist/index.js",
        format: "esm",
        sourcemap: false,
      },
    ],
    external: ["react"],
    plugins: [ commonjs()],
  },
];
