import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email, hash },
      });
      
    } catch (error) {

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credentials Taken');
      }

      throw error;
    }
  }
  async signin(dto: AuthDto) {
    //Find User by Email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    //If user does not exist throw an exception
    if (!user) {
      throw new ForbiddenException('Credentials Incorrect');
    }
    //Compare passwords
    const pwMatches = await argon.verify(user.hash, dto.password);
    //if password incorrect throw an exception
    if (!pwMatches) {
      throw new ForbiddenException('Credentials Incorrect');
    }
    return this.signToken(user.id,user.email);
  }
  async signToken(userId: number, email: string): Promise<{access_token: string}> {
    const payload = {
        sub: userId,
        email
    }
    const secret = this.config.get('JWT_SECRET')
    const token = await this.jwt.signAsync(payload,{
        expiresIn: '30m',
        secret
    })
    return {access_token: token}
}
async findOrCreateUser(user: GoogleAuthDto) {
  let existingUser = await this.prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!existingUser) {
    existingUser = await this.prisma.user.create({
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        // Set up password as null or use a default password, considering that Google Sign in users won't use it
        hash: null,
      },
    });
  } else {
    existingUser = await this.prisma.user.update({
      where: { email: user.email },
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  return existingUser;
}


}
