import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SigninSchema, signinSchema } from "../lib/zod-type/signin-type";

export function MainSigninForm() {
	const form = useForm<SigninSchema>({
		resolver: zodResolver(signinSchema),
		defaultValues: {
			email: "",
			password: "",
		}
	})

	return (

	)
}