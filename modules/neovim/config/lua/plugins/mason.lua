local tools = {
  "typescript-language-server",
  "html-lsp",
  "css-lsp",
  "tailwindcss-language-server",
  "emmet-ls",
  "stylua",
  "prettier",
  "prettierd",
  "eslint_d",
  "cpplint",
  "clang-format",
}

-- Mason ships clangd only for x86_64 Linux; modules/neovim/install.sh installs Ubuntu's clangd elsewhere.
if vim.uv.os_uname().machine == "x86_64" then
  table.insert(tools, "clangd")
end

return {
  "williamboman/mason.nvim",
  dependencies = { "WhoIsSethDaniel/mason-tool-installer.nvim" },
  config = function()
    require("mason").setup({ ui = { border = "rounded" } })
    require("mason-tool-installer").setup({ ensure_installed = tools })
  end,
}
