"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CadastroForm() {
  return (
    <div className="font-sv font-normal w-screen h-screen grid grid-rows-12 grid-cols-18 bg-zinc-950">
      <div className="bg-zinc-800 flex justify-center items-center row-span-1 col-span-18">

      </div>

      <div className="w-full h-full p-4 bg-zinc-200 row-start-4 row-end-11 col-start-11 col-end-17">
        <div className="text-center text-4xl">Cadastrar um Usuario</div>

        <div>
          <form className="flex flex-col gap-4">

            <div className="text-2xl flex flex-col gap-2">
              <label className="text-2xl" htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                type="text"
                placeholder="Digite seu CPF"
                className="px-2 text-xl bg-zinc-800 text-zinc-200"
              />
            </div>

            <div className="text-2xl flex flex-col gap-2">
              <label className="text-2xl" htmlFor="e-mail">E-mail</label>
              <input
                id="e-mail"
                type="email"
                placeholder="Digite seu e-mail"
                className="px-2 text-xl bg-zinc-800 text-zinc-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xl" htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                className="px-2 text-xl bg-zinc-800 text-zinc-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-2xl" htmlFor="confirmar">Confirmar Senha</label>
              <input
                id="confirmar"
                type="password"
                placeholder="Confirme sua senha"
                className="px-2 text-2xl bg-zinc-800 text-zinc-200"
              />
            </div>

            <Button className="bg-zinc-900 text-slate-200 mt-2 w-full">
              Cadastrar
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
