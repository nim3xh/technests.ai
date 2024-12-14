import React from 'react';
import { Card } from 'flowbite-react';

export default function Services() {
  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Service 1 */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Service One</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id eros eu odio lobortis tristique.
          </p>
        </Card>
        {/* Service 2 */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Service Two</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Suspendisse potenti. Integer sit amet ligula vitae urna fermentum feugiat.
          </p>
        </Card>
        {/* Service 3 */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Service Three</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Curabitur accumsan, libero id bibendum consectetur, sapien metus viverra lectus, et dapibus eros lacus vel eros.
          </p>
        </Card>
        {/* Service 4 */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Service Four</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Sed euismod, metus vel mollis hendrerit, ex nisl facilisis magna, in volutpat enim sapien id erat.
          </p>
        </Card>
        {/* Service 5 */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Service Five</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Vivamus id neque eu nulla tincidunt viverra ut eget nisi. Praesent vel lacus a nunc venenatis faucibus.
          </p>
        </Card>
        {/* Service 6 */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Service Six</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Quisque euismod, augue ut viverra molestie, libero sapien pellentesque libero, at pulvinar dui justo non enim.
          </p>
        </Card>
      </div>
    </div>
  );
}
