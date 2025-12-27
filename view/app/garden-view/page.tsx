"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CadastroForm() {
  return (
    <div className="font-poppins text-slate-900 w-screen h-screen flex justify-center items-center bg-emerald-700">
      <div className="w-2/8 h-2/4 rounded-md text-md flex flex-col gap-5 px-6 py-8 bg-lime-200 shadow-lg shadow-teal-950">
        <div className="text-center font-semibold text-xl">
          Cadastrar um Usuario
        </div>

        <div>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <input
                id="cpf"
                type="text"
                placeholder="Digite seu CPF"
                className="input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <input
                id="e-mail"
                type="email"
                placeholder="Digite seu e-mail"
                className="input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                className="input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <input
                id="confirmar"
                type="password"
                placeholder="Confirme sua senha"
                className="input"
              />
            </div>

            <Button className="bg-teal-900 text-slate-200 mt-4 w-full h-12 hover:bg-teal-800 hover:scale-104 transition focus:scale-96 hover:shadow-sm hover:shadow-teal-700 font-semibold py-2 justify-center items-center rounded-sm">
              Cadastrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
