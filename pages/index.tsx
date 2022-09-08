import type { GetServerSideProps, NextPage } from 'next'
import { FormEventHandler, useCallback, useState } from "react";
import { v4 } from "uuid";

// Config Set Up
const targetEnv = 'https://sandbox.dev.clover.com'; // Pointing to Sandbox Environment
// const targetEnv = 'https://www.clover.com'; // Pointing to Prod Environment

const appID = 'RT6QT2TEFN9G2'; // Input your app ID here
const appSecret = 'c56613e0-7e71-1ee4-e5fe-bff536caf42a'; // Input your app secret here

export const getServerSideProps: GetServerSideProps = async ({query}) => {
  const {code} = query;

  if (code) {
    const tokenRes = await fetch(`${targetEnv}/oauth/token?client_id=${appID}&client_secret=${appSecret}&code=${query.code}`);
    const {access_token} = await tokenRes.json();

    if (!access_token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    return {
      props: {
        accessToken: access_token || ''
      },
    }
  }

  return {
    props: {},
    redirect: {
      permanent: false,
      destination: `${targetEnv}/oauth/authorize?client_id=${appID}`
    }
  }
}

interface Props {
  accessToken: string;
}

const Home: NextPage<Props> = ({accessToken}) => {
  const [amount, setAmount] = useState(1000);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>((event) => {
    const myHeaders = new Headers();
    myHeaders.append("X-Clover-Device-Id", "C032UQ04230221");
    myHeaders.append("X-POS-ID", "B Nails");
    myHeaders.append("Idempotency-Key", v4());
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${accessToken}`);

    const raw = JSON.stringify({
      "amount": amount,
      "final": true,
      "externalPaymentId": "32-269-674-6365"
    });

    fetch("https://sandbox.dev.clover.com/connect/v1/payments", {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    })
      .then(response => response.text())
      .then(result => {
        console.log(result)
        alert('done')
      })
      .catch(error => {
        console.log('error', error)
        alert('error')
      });
    event.preventDefault();
  }, [])

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <img className="mx-auto h-12 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
               alt="Your Company"/>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Clover REST Pay Display
            API</h2>
        </div>
        <form className="mt-8 space-y-6" action="#" method="POST" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true"/>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="amount" className="sr-only">Amount</label>
              <input id="amount" name="amount" type="number" required
                     min={1000}
                     className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                     placeholder="Amount (cent)" value={amount} onChange={(e) => {
                       setAmount(parseInt(e.target.value));
              }}/>
            </div>
          </div>

          <div>
            <button type="submit"
                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Checkout
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Home
