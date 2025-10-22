import LoginField from '../components/LoginField';
import sayHiIllustration from '@/assets/welcome-hi.png';

function Login() {
  return (
    <div className="flex min-h-screen justify-center overflow-auto bg-gray-50">
      <div className="hidden w-2/5 flex-col justify-end bg-white p-12 md:flex">
        <Slogan />
      </div>

      <div className="flex w-full max-w-md flex-col justify-center md:w-3/5 md:max-w-screen md:items-center md:justify-end">
        <div className="px-4 md:hidden">
          <Slogan />
        </div>

        <div className="mx-auto w-full max-w-md p-4 md:mb-48">
          <LoginField />
        </div>
      </div>
    </div>
  );
}

const Slogan: React.FC = () => (
  <div className="">
    <img
      className="mb-4 size-48 object-contain"
      src={sayHiIllustration}
      alt="A avocado avatar waving hi"
    />
    <h1 className="max-w-96 py-4 font-serif font-medium md:text-3xl">
      Welcome back to your intelligent food assistant!
    </h1>
  </div>
);

export default Login;
