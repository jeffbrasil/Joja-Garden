"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CadastroForm() {
  return (
    <div className="font-poppins text-primary w-screen h-screen flex justify-center items-center bg-quinquenary">
      <div className="w-2/8 h-3/6 rounded-lg text-[18px] flex flex-col gap-5 px-6 py-8 bg-quaternary shadow-md shadow-tertiary">
        <div className="text-primary w-full text-center font-semibold text-2xl my-2">
          Cadastrar um Administrador
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

            <Button className="bg-secondary text-quaternary my-4 w-full h-12 hover:scale-104 transition focus:scale-96 hover:shadow-sm hover:shadow-secondary font-semibold py-2 justify-center items-center rounded-sm">
              Cadastrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
